# ShopNest

ShopNest is a JavaScript e-commerce demo with a React storefront, an Express API, and MongoDB persistence. It includes customer product browsing and accounts, a Redux-backed cart, order records, and admin-facing product, order, and analytics tools. The repository describes itself in the UI as an educational/portfolio project; it is not a production-ready commerce system.

## Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Run the Application](#run-the-application)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Workflows and Current Limitations](#workflows-and-current-limitations)
- [Scripts](#scripts)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- Browse a featured selection and the product catalog; search products by name and view product details.
- Add products to a cart, change quantities, and retain cart contents in browser `localStorage`.
- Register and log in with passwords hashed using `bcryptjs`; authenticated API requests use JWT bearer tokens.
- Submit customer orders with shipping address information and review order history.
- Admin-only API operations for product management, order listing/status updates, and sales summary counts.
- Upload product images to Cloudinary and send registration/order emails through Gmail SMTP when configured.
- Informational About, Disclaimer, and Return Policy pages.

Some screens or service modules are present but are not fully connected. See [Workflows and Current Limitations](#workflows-and-current-limitations) before relying on checkout or user administration.

## Technology Stack

| Area           | Technologies                                                              |
| -------------- | ------------------------------------------------------------------------- |
| Frontend       | React 19, Vite 8, React Router 7                                          |
| Client state   | Redux Toolkit, React Redux, browser `localStorage`                        |
| Backend        | Node.js, Express 5 (ES modules)                                           |
| Database       | MongoDB, Mongoose 9                                                       |
| Authentication | JSON Web Tokens, bcryptjs                                                 |
| Integrations   | Cloudinary, Nodemailer/Gmail SMTP, Razorpay SDK (controller code present) |
| Tooling        | npm, Nodemon, Concurrently, Oxlint                                        |

## Architecture

```text
React app (Vite, normally :5173)
    | /api requests via Vite development proxy
    v
Express API (:5000 by default)
  +-- auth, product, order, payment, analytics routers
  +-- JWT and admin middleware
  +-- controllers -- Mongoose models -- MongoDB
  |     +-- product images -- Cloudinary
  +-- registration/order messages -- Gmail SMTP
```

The Vite server forwards `/api` requests to `http://localhost:5000`. The backend can also serve the built frontend from `frontend/E_Commerse/dist` when `NODE_ENV=production`. The frontend stores the signed-in user/token and cart in `localStorage`; protected API routes expect `Authorization: Bearer <token>`.

## Repository Structure

```text
.
+-- package.json                 # Root orchestration scripts
+-- package-lock.json
+-- README.md
+-- backend/
|   +-- index.js                 # Express app, middleware, API mounts
|   +-- package.json
|   +-- package-lock.json
|   +-- config/                  # MongoDB and Cloudinary setup
|   +-- controller/              # Auth, products, orders, payments, analytics
|   +-- middlewares/             # JWT authentication and admin authorization
|   +-- models/                  # User, Product, Order, Review schemas
|   +-- routes/                  # API route definitions
|   +-- uploads/                 # Multer temporary upload destination
|   +-- utils/                   # Email helper
|   +-- seed.js                  # Demo data initializer
+-- frontend/
    +-- E_Commerse/
        +-- package.json
        +-- vite.config.js
        +-- public/              # ShopNest logo asset
        +-- src/
            +-- admin/           # Dashboard and admin screens
            +-- components/      # Navbar, footer, product card
            +-- context/         # Authentication context
            +-- pages/           # Store, account, checkout, policy pages
            +-- redux/           # Cart slice and store
            +-- styles/          # App stylesheets
```

The frontend directory is named `E_Commerse` in the repository; keep that spelling in commands and paths.

## Setup

### Prerequisites

- Node.js and npm versions compatible with the installed Vite 8 toolchain.
- A MongoDB instance and a connection URI.
- Cloudinary credentials to create or replace product images. Gmail app-password credentials are needed for actual email delivery. Razorpay variables are read by the payment controller, but its routes are not currently wired to that controller.

### Install dependencies

From the repository root:

```bash
npm run install-all
```

This installs root dependencies, then dependencies for the backend and frontend. The API loads environment variables from `backend/.env`; create that file using the template below.

## Environment Variables

Create `backend/.env`. These are the variable names read by the current source; leave integration values blank when not using that integration. Do not commit this file.

```dotenv
# Required for the API and JWT authentication
MONGO_URI=mongodb://127.0.0.1:27017/shopnest
JWT_SECRET=replace-with-a-long-random-secret

# Optional server settings (PORT defaults to 5000)
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Product image uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Registration and order emails (Gmail app password)
GMAIL_USER=
GMAIL_PASS=

# Referenced by payment.controller.js; payment endpoints are not currently connected
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

`MONGO_URI` and `JWT_SECRET` are needed for normal API operation. Cloudinary credentials are needed for the admin image-upload workflow. Email sending is attempted by registration and order creation; delivery failures are logged and do not fail those requests. `FRONTEND_URL` is added to the backend CORS allowlist; the frontend dev server proxies API calls to port 5000.

## Run the Application

Start both development servers from the repository root:

```bash
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The API listens on `http://localhost:5000` by default; its development root responds with a status message.

To build the frontend and serve that build through Express:

```bash
npm run build
```

Then start the backend with `NODE_ENV=production` and the other backend environment variables configured. Express serves the generated `frontend/E_Commerse/dist` directory. The root `start` script starts only the backend; it does not build the frontend or start Vite.

### Optional demo data

With `backend/.env` configured, run:

```bash
npm run seed
```

**Warning:** the seed script deletes all existing `User` and `Product` documents before inserting demo records. Do not run it against data you need to keep. It inserts an admin account with hard-coded demo credentials and four sample products. Inspect `backend/seed.js` for local demo access; change/remove those credentials before any shared deployment.

## API Reference

All routes are mounted under `/api`. Protected routes use `Authorization: Bearer <JWT>`; admin routes additionally require the authenticated user's role to be `admin`. JSON request bodies are shown conceptually; product create/update requests use `multipart/form-data` with an `image` file field when uploading an image.

| Method   | Path                     | Access             | Behavior                                                                                                  |
| -------- | ------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/auth/register`     | Public             | Create an account from `name`, `email`, and `password`; returns user data and a JWT.                      |
| `POST`   | `/api/auth/login`        | Public             | Authenticate with `email` and `password`; returns user data and a JWT.                                    |
| `POST`   | `/api/auth/user`         | Admin              | Return all users without password fields.                                                                 |
| `GET`    | `/api/products`          | Public             | List products.                                                                                            |
| `GET`    | `/api/products/:id`      | Public             | Get one product by MongoDB ID.                                                                            |
| `POST`   | `/api/products`          | Admin              | Create a product using `name`, `description`, `price`, `category`, `stock`, and image file field `image`. |
| `PUT`    | `/api/products/:id`      | Admin              | Update product fields; an optional `image` file replaces the image.                                       |
| `DELETE` | `/api/products/:id`      | Admin              | Delete a product.                                                                                         |
| `POST`   | `/api/orders`            | Authenticated user | Create an order with `items`, `totalAmount`, `address`, and optional `paymentId`.                         |
| `GET`    | `/api/orders/myorders`   | Authenticated user | List the current user's orders.                                                                           |
| `GET`    | `/api/orders`            | Admin              | List all orders, with user ID/name populated.                                                             |
| `PUT`    | `/api/orders/:id/status` | Admin              | Set order `status` to `Pending`, `Shipped`, or `Delivered`.                                               |
| `GET`    | `/api/analytics`         | Admin              | Return `totalOrders`, `totalProducts`, `totalUsers`, and `totalRevenue`.                                  |

An order's `items` entries contain `productId`, `qty`, and `price`. `address` contains `fullName`, `street`, `city`, `postalCode`, and `country`. The API currently does not validate payment before accepting an order.

## Data Models

| Model     | Main fields                                                                              | Notes                                                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`    | `name`, unique `email`, hashed `password`, `role`, `verified`                            | `role` is `user` or `admin` (default `user`); timestamps are enabled. `verified` defaults to false, but there is no verification endpoint/flow. |
| `Product` | `name`, `description`, `price`, `category`, `stock`, `imageUrl`, `ratings`, `numReviews` | `ratings` and `numReviews` default to zero; timestamps are enabled.                                                                             |
| `Order`   | `userId`, `items`, `totalAmount`, `address`, `paymentId`, `status`                       | References a user and products. Status defaults to `Pending`; timestamps are enabled.                                                           |
| `Review`  | `productId`, `userId`, `name`, `rating`, `comment`                                       | Schema exists with a 1-5 rating, but no review route or UI workflow is implemented.                                                             |

## Workflows and Current Limitations

- **Browse and cart:** the storefront loads products from the API. Cart lines are keyed by product ID and persisted in browser storage. Product stock is displayed, but cart/order creation does not enforce inventory.
- **Accounts:** registration hashes passwords and returns a 30-day JWT. The server sends a welcome email containing a generated OTP when email settings work, but it does not store or verify that OTP.
- **Orders:** checkout submits order records and the profile page lists the signed-in user's orders. The API also emails an order confirmation when possible.
- **Admin:** server-side middleware protects product writes, order administration, analytics, and user listing. The admin dashboard and product/order pages call these APIs.
- **Payment integration is incomplete:** a Razorpay controller exists, but `paymentRoutes.js` currently registers order-controller handlers instead of the Razorpay create/verify handlers. The checkout calls `/api/payment/order` and `/api/payment/verify`, which are not implemented by the mounted routes. Checkout also expects `window.Razorpay`, but the frontend HTML does not load the Razorpay checkout script. The UI has a student bypass path, but payment should be treated as unavailable/demo-only.
- **Admin user list path mismatch:** the API exposes `POST /api/auth/user`, while the admin user page requests `GET /api/auth/users`; that screen will not load users until the route and client are aligned.
- **Production readiness:** the repository contains no automated test suite, and payment verification, inventory enforcement, account verification, and review workflows are not complete. Do not use this project to process real payments or sensitive production data.

## Scripts

Run root commands from the repository root. Frontend-only commands use the `--prefix` shown.

| Command                                        | Purpose                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| `npm run install-all`                          | Install root, backend, and frontend dependencies.                       |
| `npm run dev`                                  | Start the backend in Nodemon and the frontend in Vite concurrently.     |
| `npm run start:backend`                        | Start the backend through its development script (Nodemon).             |
| `npm run start:frontend`                       | Start the Vite development server.                                      |
| `npm start`                                    | Start only the backend with Node.                                       |
| `npm run build`                                | Install frontend dependencies and build the frontend.                   |
| `npm run seed`                                 | Delete existing users/products and insert demo data; see warning above. |
| `npm --prefix backend run start`               | Start backend directly with Node.                                       |
| `npm --prefix backend run dev`                 | Start backend with Nodemon.                                             |
| `npm --prefix frontend/E_Commerse run dev`     | Start frontend with Vite.                                               |
| `npm --prefix frontend/E_Commerse run build`   | Build frontend assets.                                                  |
| `npm --prefix frontend/E_Commerse run preview` | Preview the frontend production build.                                  |
| `npm --prefix frontend/E_Commerse run lint`    | Run Oxlint.                                                             |

There are no test scripts configured in the current package manifests.

## Screenshots

No application screenshots are included in the repository. The frontend logo is available at `frontend/E_Commerse/public/ShopNestLogo.png`.

## Contributing

1. Create a focused branch for your change.
2. Keep changes aligned with the existing React, Express, and Mongoose structure.
3. Run the frontend lint and build commands, and verify affected API workflows locally.
4. Open a pull request describing the change and its verification.

Never include `.env` files, credentials, or private keys in a commit. No project-specific contribution guide or automated test suite is currently present.

## License

The root and backend `package.json` files declare the `ISC` license. A standalone `LICENSE` file is not present in the repository.
