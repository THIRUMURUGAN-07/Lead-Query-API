# Lead Filter Query API

A REST API built with **Node.js, Express, TypeScript, and PostgreSQL** for querying leads with filtering, pagination, validation, authentication, and role-based access control.

## Features

- Filter leads using multiple query parameters
- Pagination support
- Request validation
- Authentication middleware
- Role-based lead access control
- PostgreSQL database integration
- TypeScript support
- Automated testing with Vitest

## Project Structure

```text
src/
├── app.ts
├── server.ts
│
├── controllers/
│   └── queryLeads.ts
│
├── db/
│   └── client.ts
│
├── middleware/
│   └── auth.ts
│
├── routes/
│   └── leadRoutes.ts
│
├── services/
│   ├── filters.ts
│   └── leadAccess.ts
│
├── types/
│   ├── auth.ts
│   ├── express.d.ts
│   └── lead-filter.ts
│
├── validation/
│   └── queryLeads.ts
│
└── tests/
    ├── filters.test.ts
    ├── leadAccess.test.ts
    ├── queryLeads.test.ts
    └── queryLeads.validation.test.ts
```

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate to the project:

```bash
cd lead-query-api
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=your_database_connection_string
PORT=3000
```

> Do not commit your `.env` file to GitHub.

## Running the Application

Start the development server:

```bash
npm run dev
```

The server will run at:

```text
http://localhost:3000
```

## API Endpoint

### Query Leads

```http
POST /api/v1/leads/query
```

This endpoint allows authenticated users to query leads based on supported filters.

### Example Request

```json
{
  "filters": {
    "status": "active"
  },
  "page": 1,
  "limit": 10
}
```

### Example Response

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

## Authentication

The API uses request headers to identify the authenticated user.

Example:

```http
tenantId: your-tenant-id
userId: your-user-id
role: admin
```

Access to leads is controlled based on the authenticated user's role and permissions.

## Testing

Run the test suite:

```bash
npm test
```

Current test coverage includes:

- Filter logic
- Lead access control
- Lead query controller
- Request validation
- Pagination behavior
- Authentication and authorization scenarios

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod
- Vitest

## Project Status

Completed core implementation with automated tests.

**Test Results:**

```text
Test Files: 4 passed
Tests: 22 passed
```

## Author

Thirumurugan
