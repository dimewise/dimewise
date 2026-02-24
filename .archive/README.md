# Dimewise - Personal Finance Tracker

A personal finance management app for tracking expenses, managing budgets, and gaining spending insights. Currently built with React Native and Expo for mobile.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database](#database)
- [Support](#support)
- [License](#license)

## Tech Stack

- **Mobile:** React Native with Expo SDK 53
  - **Database:** SQLite with Drizzle ORM
  - **UI:** React Native Paper
  - **State Management:** React Context
  - **Internationalization:** i18next
  - **Language:** TypeScript

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (for package management)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/dimewsie/dimewise.git
cd dimewise/mobile
```

2. **Install dependencies**

```bash
bun install
```

3. **Start the development server**

```bash
bun start
```

4. **Run on device/simulator**

```bash
# iOS
bun ios

# Android
bun android
```

## Development

- **Code formatting:**
  Run `bun check` (uses [Biome](https://biomejs.dev/)) to check and format code according to the project's style guide.

## Database

- Managed through [Drizzle ORM](https://orm.drizzle.team/) with SQLite
- Database schema includes:
  - Users and user settings
  - Categories with budgets
  - Payment methods
  - Expenses with verification status
  - Exchange rates for multi-currency support

## Support

- [Open an issue](https://github.com/dimewsie/dimewise/issues) for bug reports or feature suggestions
- For questions or help, start a discussion in the GitHub issues

## License

This project is proprietary software. While the source code is publicly available, this is not open source software. The code is provided for reference and educational purposes only.

**All rights reserved.** No part of this software may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.

- **Issues:** Bug reports and feature suggestions are welcome via GitHub issues
- **Contributions:** Pull requests and contributions are welcome
- **Commercial Use:** Not permitted without explicit written permission
