# shopNest - ECOM MERN

A full-stack MERN e-commerce application (ShopNest) with a Node/Express backend, MongoDB data store, and a React frontend. This README provides setup, environment variables, and running instructions to get the project running locally and for simple deployment.

**Contents**
- **Project:** Simple e-commerce app with products, users, orders, reviews, and admin routes.
- **Backend:** Node + Express + MongoDB ([backend/index.js](backend/index.js)).
- **Frontend:** React (client in `frontend/`, production build in `frontend/build`).

## Features
- User registration, login, profile
- Product listing, details, add/edit (admin)
- Cart, checkout, order creation
- Reviews and product ratings
- Admin dashboard for orders, products, users

## Tech Stack
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Frontend: React
- Authentication: JWT
- File uploads: Cloudinary (configured in `backend/config/cloudinary.js`)

## Prerequisites
- Node.js 16+ and npm
- MongoDB instance (local or Atlas)
- Cloudinary account (optional for image uploads)

## Environment Variables
Create a `.env` file in the `backend/` folder with at least the following variables:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing JWTs
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name (if using uploads)
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASS` - (optional) SMTP settings for sending emails

Example `.env` (do NOT commit):

```env
MONGO_URI=mongodb+srv://user:password@cluster0.example.mongodb.net/shopnest
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
EMAIL_HOST=smtp.example.com
EMAIL_USER=you@example.com
EMAIL_PASS=supersecret
```

## Installation

1. Install backend dependencies and setup `.env`:

```bash
cd backend
npm install
# create .env and fill values
```

2. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Development - Run Locally

Run backend (from `backend/`):

```bash
cd backend
npm run dev
```

Run frontend (from `frontend/`):

```bash
cd frontend
npm start
```

Open the frontend at http://localhost:3000 (default CRA port) and backend API at http://localhost:5000 (or the port defined in `backend/index.js`).

## Production / Build Frontend

Build static frontend files and serve from backend or a static host:

```bash
cd frontend
npm run build
# copy frontend/build to server/public or serve with your preferred host
```

## Database Seeding
If `backend/seed.js` exists (it does in this repo), use it to populate initial data. Example:

```bash
cd backend
node seed.js
```

## API Overview
- Backend entrypoint: [backend/index.js](backend/index.js)
- Routes folder: `backend/routes/` (auth, products, orders, payments, analytics)
- Controllers: `backend/controller/` (business logic)

Refer to the route files for exact endpoints and request shapes:
- [backend/routes/productRoutes.js](backend/routes/productRoutes.js)
- [backend/routes/authRoutes.js](backend/routes/authRoutes.js)
- [backend/routes/orderRoutes.js](backend/routes/orderRoutes.js)

## Useful Scripts
- `cd backend && npm run dev` - start backend with nodemon
- `cd backend && npm start` - start backend (production)
- `cd frontend && npm start` - start React dev server
- `cd frontend && npm run build` - build production frontend

## Folder Structure (top-level)
- backend/
  - index.js
  - controller/
  - routes/
  - model/
  - config/
- frontend/
  - src/
  - public/

## Contribution
PRs welcome. For changes:

1. Fork repository and create a feature branch
2. Add tests if applicable
3. Open a pull request with a clear description

## License
Specify your license here (e.g. MIT) or remove this section as appropriate.

## Contact
If you need help or want to report issues, open an issue in the repository or contact the maintainer.
