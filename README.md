# Dimewise - Personal Finance Tracker

A personal finance management app for tracking expenses, managing budgets, and gaining spending insights. Currently built with React Native and Expo for mobile.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database](#database)
- [Testing](#testing)
- [Support](#support)
- [License](#license)

## Features

- Track expenses with categories and payment methods
- Manage budget categories with spending limits
- Monthly overview and spending insights
- Multi-currency support (30+ currencies)
- Internationalization (English/Japanese)
- Offline-first with local SQLite database
- Dark/light theme support

## Tech Stack

- **Framework:** React Native with Expo SDK 53
- **Navigation:** Expo Router
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

## Testing

- **Run all tests:**

```bash
bun test
```

- Tests are written with [Jest](https://jestjs.io/) and [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/).

## Support

- [Open an issue](https://github.com/dimewsie/dimewise/issues) for bug reports or feature suggestions
- For questions or help, start a discussion in the GitHub issues

## License

This project is proprietary software. While the source code is publicly available, this is not open source software. The code is provided for reference and educational purposes only.

**All rights reserved.** No part of this software may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the copyright holder.

- **Issues:** Bug reports and feature suggestions are welcome via GitHub issues
- **Contributions:** Pull requests and contributions are welcome
- **Commercial Use:** Not permitted without explicit written permission
