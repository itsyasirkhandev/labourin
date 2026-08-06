# LabourIn

LabourIn is a mobile-first platform connecting customers with verified, available service providers. Built with Next.js, Convex, Clerk Auth, Effect-TS, and Zustand.

## Tech Stack

| Technology | Purpose | Description |
| :--- | :--- | :--- |
| **Next.js** | Frontend Framework | React-based framework for page routing and server-side rendering. |
| **Convex** | Backend Database & Server | Real-time cloud database and serverless functions backend. |
| **Clerk Auth** | Client Authentication | Manages user sign-in flows and sessions. |
| **Effect-TS** | Functional Programming | Used for robust error handling, config parsing, and standard services. |
| **Zustand** | Client State Management | Minimalist, client-side React state management. |
| **TailwindCSS** | Component Styling | Utility-first CSS framework for modern responsive styles. |

## Getting Started

Follow these steps to set up the template:

1. Run the command:
   ```bash
   pnpm dev
   ```
2. Set up Convex when prompted. Authenticate and connect an existing project or create a new project from scratch.
3. Visit the [Clerk Dashboard](https://dashboard.clerk.com/), set up a new project.
4. Copy the Clerk environment variables into the `.env.local` file (this file is created automatically in the project root during Step 2). Refer to `.env.example` for the correct variable names.
5. You are all set up with Convex, Next.js, and Clerk Auth!
