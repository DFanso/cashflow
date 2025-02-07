# Cashflow Tracker

A modern web application for tracking personal finances, built with Next.js, Prisma, and TypeScript.

## Features

- 💰 **Transaction Management**
  - Track income and expenses
  - Categorize transactions
  - Add descriptions and dates
  - Edit or delete transactions

- 🔄 **Recurring Payments**
  - Set up automatic recurring transactions
  - Support for daily, weekly, monthly, and yearly frequencies
  - Track recurring income and expenses

- 📊 **Financial Reports**
  - Year-over-year analysis
  - Monthly trend charts
  - Category-wise breakdowns
  - Income and expense distribution
  - Savings rate calculation

- 💾 **Data Management**
  - Backup your financial data
  - Restore from backup files
  - Safe transaction handling

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark mode support
  - Interactive charts
  - Clean and intuitive interface

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide Icons
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dfanso/cashflow.git
   cd cashflow
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm prisma db seed
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Backup

1. Navigate to the Reports page
2. Click the "Backup" button
3. Save the generated JSON file

### Restore

1. Navigate to the Reports page
2. Click "Restore"
3. Select your backup JSON file
4. Confirm the restore operation

## Project Structure

```
cashflow/
├── prisma/                # Database schema and migrations
├── public/               # Static files
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/             # Utility functions and shared logic
│   └── styles/          # Global styles
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
