#!/bin/bash

# Define colors for echo statements
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to the client directory
cd client/ || {
	echo -e "${YELLOW}⚠️ Error: Failed to change directory to client/. Make sure the directory exists.${NC}"
	exit 1
}

# Copy env files
echo -e "${GREEN}ℹ️  Copying .env.example to .env...${NC}"
cp .env.example .env

# Setup hooks for git
echo -e "${GREEN}ℹ️  Setting up pre-commit and pre-push hooks for git...${NC}"
cp scripts/hooks/pre-commit .git/hooks/pre-commit
cp scripts/hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push

# Start installation of packages (check if user has bun installed)
echo -e "${GREEN}ℹ️  Installing packages...${NC}"
if ! [ -x "$(command -v bun)" ]; then
	echo -e "${YELLOW}⚠️ Error: bun is not installed. Please install bun by running 'brew install oven-sh/bun/bun'${NC}" >&2
	exit 1
fi

bun install

# Start the local supabase cli
echo -e "${GREEN}ℹ️  Setting up local supabase instance...${NC}"
bun db:start

# Hydrate env key value pair
echo -e "${GREEN}ℹ️  Populating supabase relevant env variables...${NC}"
supabase_status=$(bun db:status)

# Extract API URL and anon key
api_url=$(echo "$supabase_status" | grep "API URL:" | cut -d ':' -f 2- | tr -d '[:space:]')
anon_key=$(echo "$supabase_status" | grep "anon key:" | cut -d ':' -f 2- | tr -d '[:space:]')

# Update .env file
echo -e "${GREEN}ℹ️  Updating .env file...${NC}"
sed -i.bak "s|PUBLIC_SUPABASE_URL=your_supabase_api_url|PUBLIC_SUPABASE_URL=$api_url|" .env
sed -i.bak "s|PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key|PUBLIC_SUPABASE_ANON_KEY=$anon_key|" .env

# Remove backup file created by sed
rm .env.bak

# Deprecated, we are only using auth on the frontend
# Start migrations and seeding
# echo -e "${GREEN}ℹ️  Running database migrations and seeds...${NC}"
# bun db:migration-up-local

echo -e "${GREEN}✅ Initialization complete! 🚀${NC}"
echo -e "${GREEN}ℹ️  You can now run the app by running 'bun dev' in the terminal.${NC}"
