# Flipkart Clone - E-Commerce Platform

A full-stack e-commerce web application that closely replicates Flipkart's design and user experience.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express 5 + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: OpenAPI 3.1 spec with Orval codegen (React Query hooks)
- **Package Manager**: pnpm workspaces (monorepo)
- **Validation**: Zod

## Features

- Product listing page with search and category filters
- Product detail page with image carousel, specs, and highlights
- Shopping cart (add, update quantity, remove)
- Checkout with shipping address form and payment method selection
- Order confirmation page with order ID
- Order history page

## Project Structure

```
├── artifacts/
│   ├── flipkart-clone/     # React + Vite frontend
│   └── api-server/         # Express API backend
├── lib/
│   ├── api-spec/           # OpenAPI spec + codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM schema + DB client
└── scripts/
    └── src/seed.ts         # Database seed script
```

## Setup Instructions (VS Code / Local)

### Prerequisites

- Node.js 20+ — download from https://nodejs.org
- pnpm — run `npm install -g pnpm`
- PostgreSQL — download from https://www.postgresql.org/download

### 1. Install Dependencies

Open the project folder in VS Code, then open the terminal and run:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a file named `.env` in the **root** of the project with:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/flipkart_clone
```

Replace `yourpassword` with your PostgreSQL password. Also create a database named `flipkart_clone` in PostgreSQL first.

### 3. Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Seed Sample Data

```bash
pnpm --filter @workspace/scripts run seed
```

This seeds 16 products across 8 categories.

### 5. Run the Application

Open **two terminals** in VS Code:

**Terminal 1 — API Backend (runs on port 8080):**

```bash
pnpm --filter @workspace/api-server run dev:local
```

**Terminal 2 — Frontend (runs on port 5173):**

```bash
pnpm --filter @workspace/flipkart-clone run dev
```

Open **http://localhost:5173** in your browser.

> The frontend automatically proxies all `/api` calls to the backend on port 8080, so no extra config is needed.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, category, price filters) |
| GET | `/api/products/:id` | Get product details |
| GET | `/api/categories` | List all categories |
| GET | `/api/cart` | Get cart contents |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:id` | Update cart item quantity |
| DELETE | `/api/cart/items/:id` | Remove cart item |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order details |

## Database Schema

- **categories** — Product categories
- **products** — Products with pricing, ratings, images, specs
- **cart_items** — Shopping cart entries
- **orders** — Placed orders with shipping address and payment
- **order_items** — Line items per order

## Assumptions

- Single default guest user (no authentication required)
- Cart is shared across one session
- Free delivery for orders above ₹500, otherwise ₹40
- Estimated delivery is 5 days from order placement
- Product images use Unsplash URLs
