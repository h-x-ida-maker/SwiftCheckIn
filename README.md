# SwiftCheckIn

SwiftCheckIn is a modern, QR-code based event check-in application built with Next.js. It allows event organizers to manage event details, view real-time statistics, and verify attendee tickets via QR code scanning.

## Features

- **Dashboard**: Real-time overview of event statistics, including total seats, check-in count, and recent activity.
- **QR Code Scanning**: Built-in scanner to verify attendee tickets effectively.
- **Data Persistence**: Currently uses local storage for a simple, zero-setup demo experience.
- **Responsive Design**: Built with Tailwind CSS and Shadcn UI for a premium look and feel on all devices.

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS, Shadcn UI
- **Language**: TypeScript
- **AI/Backend**: Genkit (configured)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd SwiftCheckIn
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running Locally

To start the development server:

```bash
yarn dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

### Running Genkit

This project includes Genkit configuration. To start the Genkit developer UI:

```bash
yarn genkit:dev
```

## Project Structure

- `src/app`: Application pages and routing
- `src/components`: Reusable UI components
- `src/lib`: Utility functions, data access, and types
- `src/ai`: Genkit configuration and AI-related code
