# Courseify Backend - Course Management System

**Screenshots: https://drive.google.com/drive/folders/1UFcEqw8umFnBLrlZKILNHYxyK34mqu7H**

**Backend Endpoint: https://courseify-eight.vercel.app/**

**Frontend: https://courseify25.vercel.app/**

**Backend Repo: https://github.com/16SULPHUR/Guildup-Assignment-Backend/**

**Frontend Repo: https://github.com/16SULPHUR/courseify**

This is the backend for Courseify, a Course Management System built with Node.js, Express.js, and MongoDB. It provides APIs for managing users, courses, course packages, and includes features like location-based pricing and JWT authentication.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [API Endpoint Documentation](#api-endpoint-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Courses](#courses)
  - [Packages](#packages)
  - [Health Check](#health-check)
- [Folder Structure](#folder-structure)
- [Key Libraries Used](#key-libraries-used)


## Features

*   User registration and JWT-based authentication.
*   Full CRUD operations for Courses.
*   Full CRUD operations for Packages (groupings of courses).
*   Data validation using Mongoose and Zod.
*   Location-based dynamic pricing for courses and packages.
    *   Price adjustments based on user's country.
    *   Currency conversion to local currencies (via ExchangeRate-API).
    *   Access restriction for blacklisted countries.
*   Image URL management for courses, packages, and user profiles (assumes image hosting is external).

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose ODM
*   **Authentication:** JSON Web Tokens (JWT)
*   **Validation:** Zod (for request validation), Mongoose Schemas
*   **API Testing:** Postman / Thunder Client
*   **Language:** TypeScript
*   **Currency Conversion:** [ExchangeRate-API.com](https://www.exchangerate-api.com) (requires API key)

## Prerequisites

Before you begin, ensure you have met the following requirements:

*   [Node.js](https://nodejs.org/) (v16.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud-hosted like MongoDB Atlas)
*   An API key from [ExchangeRate-API.com](https://www.exchangerate-api.com) for currency conversion.

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd courseify-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and fill in your specific configuration values (see [Environment Variables](#environment-variables) section below).

4.  **Ensure MongoDB is running:**
    If using a local MongoDB instance, make sure it's started.

## Environment Variables

The following environment variables need to be set in your `.env` file:

| Variable                  | Description                                                                                                | Example Value                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `PORT`                    | The port the application will run on.                                                                      | `5000`                                                   |
| `MONGO_URI`               | Your MongoDB connection string.                                                                            | `mongodb://localhost:27017/courseify_db`                 |
| `DEFAULT_CURRENCY`        | The base currency for course prices stored in the DB.                                                      | `USD`                                                    |
| `LOCATION_MULTIPLIERS`    | JSON string for country-specific price multipliers. Key is uppercase country name.                         | `{"USA": 1.1, "UK": 1.05}`                               |
| `BLACKLISTED_COUNTRIES`   | Comma-separated list of lowercase country names to block access/purchase from.                             | `north korea,iran`                                       |
| `JWT_SECRET`              | A strong, secret key for signing JWTs. **Change this to a secure random string.**                            | `your-very-strong-jwt-secret-key-please-change-me`       |
| `JWT_EXPIRES_IN`          | How long a JWT is valid for (e.g., `90d`, `24h`, `7d`).                                                      | `90d`                                                    |
| `EXCHANGE_RATE_API_KEY`   | Your API key from [ExchangeRate-API.com](https://www.exchangerate-api.com).                                | `your_exchangerate_api_key_here`                         |
| `BASE_CURRENCY_FOR_RATES` | The base currency your ExchangeRate-API key is configured for (usually USD for free tier).                 | `USD`                                                    |
| `NODE_ENV`                | Set to `development` or `production`. Affects logging and error handling.                                  | `development`                                            |

**`.env.example`:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/courseify_db_dev
NODE_ENV=development

DEFAULT_CURRENCY=USD
LOCATION_MULTIPLIERS={"USA": 1.1, "UK": 1.05, "INDIA": 0.9}
BLACKLISTED_COUNTRIES=north korea,iran

JWT_SECRET=replace_this_with_a_very_strong_random_secret_key
JWT_EXPIRES_IN=90d

EXCHANGE_RATE_API_KEY=YOUR_EXCHANGERATEAPI_KEY
BASE_CURRENCY_FOR_RATES=USD
```

## Running the Application

### Development Mode

For development, the server will use `ts-node-dev` for automatic restarts on file changes.

```bash
npm run dev
```
The server will typically start on `http://localhost:5000` (or the port specified in your `.env`).

### Production Mode

For production, first build the TypeScript code, then start the server:

1.  **Build the application:**
    ```bash
    npm run build
    ```
    This will compile TypeScript files from `src/` to JavaScript files in the `dist/` directory.

2.  **Start the server:**
    ```bash
    npm start
    ```

## API Endpoint Documentation

Base URL for all API endpoints: `/api/v1`

### Authentication

*   **`POST /auth/register`**
    *   Description: Registers a new user.
    *   Request Body:
        ```json
        {
          "name": "John Doe",
          "email": "john.doe@example.com",
          "password": "password123",
          "phone": "1234567890",
          "location": "USA" // Optional
        }
        ```
    *   Response: User object and JWT token.

*   **`POST /auth/login`**
    *   Description: Logs in an existing user.
    *   Request Body:
        ```json
        {
          "email": "john.doe@example.com",
          "password": "password123"
        }
        ```
    *   Response: User object and JWT token.

*   **`GET /auth/me`** (Protected)
    *   Description: Gets the profile of the currently authenticated user.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Response: User object.

### Users

*   **`GET /users/:userId`**
    *   Description: Gets public profile information for a user by their custom `userId` (UUID).
    *   Response: User object (excluding sensitive info like password).
    *   _Note: Currently, this endpoint might be basic. User update/delete is typically handled via account settings, not direct API calls unless for admin purposes._

### Courses

*   **`POST /courses`** (Protected)
    *   Description: Creates a new course. `creatorId` is automatically set from the authenticated user.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Request Body:
        ```json
        {
          "title": "Advanced TypeScript",
          "description": "Deep dive into TypeScript features.",
          "price": 99.99, // Base price in USD
          "image": "http://example.com/image.jpg" // Optional URL
        }
        ```
    *   Response: Created course object.

*   **`GET /courses`**
    *   Description: Retrieves a list of all courses.
    *   Query Params (Optional): `?location=India` (Country name for localized pricing)
    *   Response: Array of course objects, potentially with `localizedPriceInfo`.

*   **`GET /courses/my-courses`** (Protected)
    *   Description: Retrieves courses created by the authenticated user.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Query Params (Optional): `?location=USA`
    *   Response: Array of user's course objects, potentially with `localizedPriceInfo`.

*   **`GET /courses/:courseId`**
    *   Description: Retrieves details for a specific course by its custom `courseId` (UUID).
    *   Query Params (Optional): `?location=Germany`
    *   Response: Course object, potentially with `localizedPriceInfo`.

*   **`PUT /courses/:courseId`** (Protected)
    *   Description: Updates an existing course. User must be the creator.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Request Body: (Fields to update)
        ```json
        {
          "title": "Expert TypeScript",
          "price": 129.99
        }
        ```
    *   Response: Updated course object.

*   **`DELETE /courses/:courseId`** (Protected)
    *   Description: Deletes a course. User must be the creator.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Response: `204 No Content`.

### Packages

*   **`POST /packages/create`** (Protected)
    *   Description: Creates a new package of courses. `creatorId` is set from the authenticated user.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Request Body:
        ```json
        {
          "title": "Full-Stack Developer Bundle",
          "courseIds": ["<mongoose_object_id_of_course1>", "<mongoose_object_id_of_course2>"],
          "image": "http://example.com/package.jpg" // Optional
        }
        ```
    *   Response: Created package object.

*   **`GET /packages`**
    *   Description: Retrieves a list of all packages.
    *   Query Params (Optional): `?location=Canada`
    *   Response: Array of package objects, potentially with `localizedPriceInfo` for the total package value.

*   **`GET /packages/my-packages`** (Protected)
    *   Description: Retrieves packages created by the authenticated user.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Query Params (Optional): `?location=UK`
    *   Response: Array of user's package objects, potentially with `localizedPriceInfo`.

*   **`GET /packages/:packageId`**
    *   Description: Retrieves details for a specific package by its custom `packageId` (UUID).
    *   Query Params (Optional): `?location=Australia`
    *   Response: Package object, potentially with `localizedPriceInfo`.

*   **`PUT /packages/:packageId`** (Protected)
    *   Description: Updates an existing package (e.g., title, image). User must be the creator. (Note: Modifying `courseIds` is not supported via this generic update in the current implementation).
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Request Body:
        ```json
        {
          "title": "Ultimate Web Developer Pack",
          "image": "http://example.com/new_package_image.jpg"
        }
        ```
    *   Response: Updated package object.

*   **`DELETE /packages/:packageId`** (Protected)
    *   Description: Deletes a package. User must be the creator.
    *   Headers: `Authorization: Bearer <YOUR_JWT_TOKEN>`
    *   Response: `204 No Content`.

### Health Check

*   **`GET /api/v1/health`**
    *   Description: Checks the health of the API.
    *   Response:
        ```json
        {
          "status": "UP"
        }
        ```

## Folder Structure

```
src/
├── app.ts               # Express app configuration
├── server.ts            # Server entry point
├── config/
│   └── db.ts            # Database connection
├── controllers/         # Route handlers (logic for requests/responses)
│   ├── authController.ts
│   ├── userController.ts
│   ├── courseController.ts
│   └── packageController.ts
├── middlewares/         # Express middlewares
│   ├── authMiddleware.ts  # JWT protection
│   ├── errorHandler.ts    # Global error handler
│   ├── asyncHandler.ts    # Wraps async route handlers
│   └── validateRequest.ts # Zod validation middleware
├── models/              # Mongoose models/schemas
│   ├── User.ts
│   ├── Course.ts
│   └── Package.ts
├── routes/              # Express routers
│   ├── index.ts         # Main router
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   ├── courseRoutes.ts
│   └── packageRoutes.ts
├── services/            # Business logic (interacts with models)
│   ├── userService.ts
│   ├── courseService.ts
│   ├── packageService.ts
│   └── pricingService.ts  # Location-based pricing logic
├── utils/               # Utility functions
│   ├── AppError.ts      # Custom error class
│   └── jwt.ts           # JWT signing/verification
└── validations/         # Zod validation schemas
    ├── authValidation.ts
    ├── userValidation.ts
    ├── courseValidation.ts
    └── packageValidation.ts
.env                     # Environment variables (ignored by git)
.env.example             # Example environment variables
tsconfig.json            # TypeScript configuration
package.json
README.md
```

## Key Libraries Used

*   **express:** Web framework for Node.js
*   **mongoose:** MongoDB object modeling tool
*   **jsonwebtoken:** For creating and verifying JWTs
*   **bcryptjs:** For hashing passwords
*   **zod:** TypeScript-first schema declaration and validation
*   **dotenv:** Loads environment variables from a `.env` file
*   **cors:** Middleware for enabling Cross-Origin Resource Sharing
*   **axios:** Promise-based HTTP client (used in pricingService for external API calls)
*   **uuid:** For generating UUIDs (used for custom `userId`, `courseId`, `packageId`)
