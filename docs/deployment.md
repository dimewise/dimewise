# VPS Setup & Deployment Guide

## Table of Contents

- [VPS Hardening](#vps-hardening)
- [DNS Configuration](#dns-configuration)
- [Deploy Key Setup](#deploy-key-setup)
- [Deployment](#deployment)
- [Updating & Redeploying](#updating--redeploying)
- [Make Commands Reference](#make-commands-reference)
- [Remote Database Access (DBeaver)](#remote-database-access-dbeaver)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

---

## VPS Hardening

These steps were performed on initial VPS setup to secure the server.

### 1. System Updates

```bash
apt update && apt upgrade -y
```

### 2. Non-Root User

```bash
adduser deploy
usermod -aG sudo deploy
```

### 3. SSH Key Authentication

From your **local machine**:

```bash
ssh-copy-id deploy@YOUR_VPS_IP
```

### 4. SSH Hardening

Edit `/etc/ssh/sshd_config`:

```
Port 2222
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
```

> **Tip:** When changing SSH port, temporarily keep both `Port 22` and `Port 2222` until you confirm the new port works, then remove port 22.

```bash
sudo systemctl restart sshd
```

### 5. Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp    # SSH
sudo ufw allow 80/tcp      # HTTP (needed for Caddy cert challenge)
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 6. Fail2Ban (brute-force protection)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 7. Automatic Security Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

### 8. Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy
# Log out and back in for group change to take effect
```

### 9. Swap (if needed)

Check existing swap first:

```bash
sudo swapon --show
free -h
```

If no swap exists and RAM is limited (1-2 GB):

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Verification Checklist

| Check                  | Command                               | Expected                          |
| ---------------------- | ------------------------------------- | --------------------------------- |
| SSH on new port        | `ssh -p 2222 deploy@VPS_IP`          | Connects successfully             |
| Root login blocked     | `ssh -p 2222 root@VPS_IP`            | Permission denied                 |
| Firewall active        | `sudo ufw status`                    | Shows 2222, 80, 443 only         |
| Fail2ban running       | `sudo systemctl status fail2ban`     | Active (running)                  |
| Docker works           | `docker run hello-world`             | Prints hello message              |

---

## DNS Configuration

Point these DNS A records to your VPS IP address:

| Record Type | Name                  | Value         |
| ----------- | --------------------- | ------------- |
| A           | `dimewise.app`        | `YOUR_VPS_IP` |
| A           | `api.dimewise.app`    | `YOUR_VPS_IP` |

> Caddy automatically provisions and renews HTTPS certificates via Let's Encrypt once DNS is pointing to the VPS.

---

## Deploy Key Setup

Generate a deploy key on the VPS so it can pull from GitHub:

```bash
# On VPS
ssh-keygen -t ed25519 -C "dimewise-vps" -f ~/.ssh/id_ed25519
# Press Enter twice (no passphrase)

cat ~/.ssh/id_ed25519.pub
```

Then on GitHub: **Repo → Settings → Deploy keys → Add deploy key**
- Title: `dimewise-vps`
- Key: paste the public key
- Leave "Allow write access" **unchecked** (read-only)

---

## Deployment

### Architecture

```
Internet
   │
   ▼
[ Caddy :443/:80 ]  ← auto HTTPS
   ├── dimewise.app      → client container (nginx, static files)
   └── api.dimewise.app  → server container (Go API :8080)
                              │
                              ▼
                         [ Postgres :5432 ]
```

### First-Time Deploy

```bash
# 1. SSH into your VPS
ssh -p 2222 deploy@YOUR_VPS_IP

# 2. Clone the repository
git clone <your-repo-url> dimewise && cd dimewise

# 3. Create the production .env file
cp build/.env.example build/.env

# 4. Edit with your real values
nano build/.env
```

Required values in `build/.env`:

```env
DOMAIN=dimewise.app
API_DOMAIN=api.dimewise.app
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_API_BASE_URL=https://api.dimewise.app
CLERK_SECRET_KEY=sk_live_xxxxx
POSTGRES_USER=dimewise
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=dimewise
```

```bash
# 5. Build and start everything
docker compose -f build/docker-compose.prod.yml --env-file build/.env up -d --build
```

### Subsequent Deploys

```bash
ssh -p 2222 deploy@YOUR_VPS_IP
cd dimewise
git pull
docker compose -f build/docker-compose.prod.yml --env-file build/.env up -d --build
```

### What Happens on Deploy

1. **Postgres** starts and runs health checks
2. **Server** container builds the Go binary, runs `goose` migrations automatically, then starts the API
3. **Client** container builds the Vite app via Bun, serves static files with nginx
4. **Caddy** starts, auto-provisions SSL certs for both domains, reverse-proxies traffic

---

## Updating & Redeploying

### Standard Update Flow

When you've made changes locally and want to deploy:

```bash
# 1. Local: commit and push
git add -A && git commit -m "your changes" && git push

# 2. SSH into VPS
ssh -p 2222 deploy@YOUR_VPS_IP
cd ~/dimewise

# 3. Pull and redeploy
git pull
make deploy
```

That's it. Docker rebuilds only the changed layers, runs migrations, and restarts.

### What gets rebuilt?

| Change type          | What rebuilds        | Downtime   |
| -------------------- | -------------------- | ---------- |
| Frontend code only   | Client container     | ~30s       |
| Backend code only    | Server container     | ~30s       |
| New migration added  | Server runs it on startup | None   |
| Env var change       | Rebuild needed for client (baked in), server picks up on restart | ~30s |
| Caddyfile change     | `make deploy-restart` or `make deploy` | ~5s |

### Rollback

```bash
# On VPS
cd ~/dimewise
git log --oneline -5          # find the last good commit
git checkout <commit-hash>    # go back
make deploy                   # redeploy
```

### Zero-Downtime Tips

- Docker Compose restarts containers one at a time
- Postgres data persists in a named volume — never lost during redeploy
- Caddy cert data also persists in volumes

---

## Make Commands Reference

All `deploy-*` commands are defined in `makefiles/deploy.mk` and available on the VPS.

| Command                  | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `make deploy`            | Build and start all production services           |
| `make deploy-build`      | Rebuild all images without cache                  |
| `make deploy-logs`       | Follow logs for all services                      |
| `make deploy-logs-server`| Follow server logs only                           |
| `make deploy-logs-client`| Follow client logs only                           |
| `make deploy-logs-caddy` | Follow Caddy logs only                            |
| `make deploy-ps`         | Show status of running containers                 |
| `make deploy-stop`       | Stop all services (keeps containers)              |
| `make deploy-restart`    | Restart all services                              |
| `make deploy-down`       | Stop and remove all containers                    |
| `make deploy-clean`      | Stop containers and **wipe all volumes** (destructive) |
| `make deploy-db-backup`  | Create a timestamped SQL backup in `backups/`     |
| `make deploy-db-shell`   | Open psql shell inside the Postgres container     |
| `make deploy-shell-server` | Open shell inside the server container          |
| `make deploy-prune`      | Remove unused Docker images and build cache       |

---

## Remote Database Access (DBeaver)

The production Postgres port is **not exposed** to the internet (only accessible within Docker). To connect from your local machine, use an **SSH tunnel**.

### Setup in DBeaver

1. **Create a new PostgreSQL connection**
2. On the **Main** tab:
   - Host: `localhost`
   - Port: `5432`
   - Database: `dimewise` (or your `POSTGRES_DB` value)
   - Username: `dimewise` (or your `POSTGRES_USER` value)
   - Password: your `POSTGRES_PASSWORD` value
3. On the **SSH** tab:
   - Enable SSH tunnel: **checked**
   - Host: your VPS IP
   - Port: `2222`
   - Username: `deploy`
   - Authentication: Public Key
   - Private key: select your local SSH private key (`~/.ssh/id_ed25519` or similar)
4. Click **Test Connection** — should succeed

### Alternative: CLI SSH Tunnel

```bash
# Open tunnel in background — maps local 15432 → remote Postgres 5432
ssh -p 2222 -L 15432:localhost:5432 deploy@YOUR_VPS_IP -N &

# Connect with psql locally
psql -h localhost -p 15432 -U dimewise dimewise
```

> **Note:** The tunnel uses `localhost:5432` on the remote side because Postgres is accessible from within the VPS Docker network. The SSH tunnel maps that to your local port.

---

## Maintenance

### View Logs

```bash
make deploy-logs            # all services
make deploy-logs-server     # server only
make deploy-logs-client     # client only
make deploy-logs-caddy      # caddy only
```

### Restart Services

```bash
make deploy-restart         # restart everything
```

### Stop Everything

```bash
make deploy-down
```

### Database Backup

```bash
make deploy-db-backup
# Saves to backups/backup_YYYYMMDD_HHMMSS.sql
```

### Database Restore

```bash
cat backups/backup_file.sql | docker compose -f build/docker-compose.prod.yml exec -T postgres \
  psql -U dimewise dimewise
```

### Prune Old Docker Resources

```bash
make deploy-prune           # removes unused images and build cache (keeps volumes)
```

---

## Troubleshooting

### Server won't start — migration error

```bash
make deploy-logs-server
```

If migrations failed, run them manually:

```bash
make deploy-shell-server
goose -dir /app/migrations postgres "$DATABASE_URL" status
```

### Caddy not issuing certs

Ensure DNS A records are pointing to the VPS IP and ports 80/443 are open:

```bash
sudo ufw status
dig dimewise.app +short
dig api.dimewise.app +short
make deploy-logs-caddy
```

### Client shows blank page

```bash
make deploy-logs-client
```

Verify env vars were baked in at build time:

```bash
docker compose -f build/docker-compose.prod.yml exec client \
  grep -r "CLERK" /usr/share/nginx/html/assets/ | head -1
```

If empty, the `VITE_CLERK_PUBLISHABLE_KEY` wasn't set during build. Fix `.env` and rebuild:

```bash
make deploy-build && make deploy
```

### Can't connect to database

```bash
docker compose -f build/docker-compose.prod.yml exec postgres \
  pg_isready -U dimewise
```

### Check running containers

```bash
make deploy-ps
```
