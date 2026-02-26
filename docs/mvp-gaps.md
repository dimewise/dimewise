# Dimewise — MVP Gaps

A prioritised list of features and improvements that are missing or incomplete
in the current MVP. Items are grouped by urgency.

---

## P0 — Must-have before first real users

### 1. Invite / Join Household Flow
There is no UI for a user to **join an existing household** via invite code.  
The API endpoint exists (`POST /households/join`) and a shareable invite code is
generated, but the client has no screen or deep-link that lets a new user
redeem that code.

**Work required:**
- "Join Household" page (or modal on the setup page) with a single text input.
- After a successful join, redirect to the dashboard.
- Deep-link support (`/household/join?code=XXXX`) for share-via-link flows.

### 2. Mobile Responsiveness Audit
The app is designed mobile-first, but several views (household settings,
report detail, budget category modal) have not been tested on narrow viewports.
A systematic audit with fixes is needed before shipping.

### 3. Rate Limiting & Abuse Protection
Neither the API nor the auth layer enforces rate limits. Before exposing the
app publicly:
- Add a rate limiter middleware (e.g. per-IP or per-user token bucket).
- Validate invite-code redemption to prevent brute-force guessing.

---

## P1 — Important for retention

### 4. Recurring / Repeat Expenses
Users frequently incur the same expenses each month (rent, internet, streaming
subscriptions). There is currently no way to:
- Mark an expense as recurring.
- Duplicate / carry forward last month's expenses into a new month.

A simple "Duplicate expense" action or a "recurring" flag with automatic
creation at month start would cover 80 % of the need.

### 5. Expense Attachments / Receipts
Allow users to attach a photo or PDF receipt when creating an expense. This
builds trust among household members and is a commonly requested feature in
shared-finance apps.

**Work required:**
- File upload endpoint (S3 / R2 presigned URL).
- Thumbnail preview in the expense detail modal.
- Storage cost consideration (limit size / count per household).

### 6. Push Notifications & Reminders
Remind household members about unsettled balances or new expenses via:
- PWA push notifications (service worker + Web Push API).
- Optional email digest (weekly or monthly).

---

## P2 — Nice-to-have / post-launch

### 7. Data Export
Allow exporting reports (and optionally raw expenses) as **CSV** or **PDF**.
Useful for record-keeping and tax purposes.

### 8. Multi-Currency Support
For diaspora or international families, support logging expenses in different
currencies with automatic conversion. This is complex (exchange-rate source,
base currency per household, display formatting) and is best deferred to a
post-MVP release.

### 9. Dark Mode
The design-system CSS already defines a `.dark` custom variant and the colour
tokens are set up for it, but no toggle or `prefers-color-scheme` listener
exists yet.

### 10. Onboarding Walkthrough
A lightweight guided tour (tooltips or a stepper) that walks a new household
owner through creating a household → inviting members → adding a budget →
logging the first expense.

---

_Last updated: auto-generated during MVP review._
