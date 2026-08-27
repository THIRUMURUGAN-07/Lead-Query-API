# Lead Filter Query API

A REST API built with **Node.js, Express, TypeScript, PostgreSQL, Zod, and Vitest** for querying leads with authentication, role-based access control, free-text search, dynamic filtering, sorting, and pagination.

---

## Features

- Authentication using request headers
- Role-based lead access control
- Multi-tenant data isolation
- Free-text search
- Dynamic filters for system and custom fields
- Support for `AND` and `OR` filter logic
- String, number, date, and boolean custom field filtering
- Empty and non-empty field checks
- Safe sorting
- Pagination with metadata
- Request validation using Zod
- PostgreSQL parameterized queries
- Automated testing with Vitest and Supertest

---

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

---

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod
- Vitest
- Supertest

---

# Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate to the project directory:

```bash
cd lead-query-api
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

> Never commit your `.env` file to GitHub.

---

# Running the Application

Start the development server:

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

---

# API Endpoint

## Query Leads

```http
POST /api/v1/leads/query
```

The endpoint supports authentication, role-based access, search, filtering, sorting, and pagination.

---

# Authentication Headers

Every request requires the following headers:

```http
x-tenant-id: <tenant-id>
x-user-id: <user-id>
x-user-role: <admin-or-agent>
```

Example:

```http
x-tenant-id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
x-user-id: a0000000-0000-0000-0000-000000000001
x-user-role: admin
```

---

# Role-Based Access

## Admin

An admin can access all leads belonging to their tenant.

## Agent

An agent can only access leads:

- Belonging to their tenant
- Assigned to that agent

This ensures tenant isolation and role-based lead access.

---

# Query Parameters

## Pagination

| Parameter | Type | Default | Rules |
|---|---|---|---|
| `page` | number | `1` | Minimum `1` |
| `limit` | number | `20` | Minimum `1`, Maximum `100` |

Example:

```http
POST /api/v1/leads/query?page=2&limit=10
```

---

## Sorting

Supported sorting fields:

- `createdAt`
- `followUpDate`

Supported directions:

- `asc`
- `desc`

Defaults:

```text
sortBy = createdAt
sortDirection = desc
```

Example:

```http
POST /api/v1/leads/query?sortBy=followUpDate&sortDirection=asc
```

---

# Request Body

The request body supports:

```json
{
  "q": "search text",
  "logic": "AND",
  "filters": []
}
```

All fields are optional.

---

# Free-Text Search

The `q` field searches across:

- Lead name
- Phone
- Email
- E.164 phone number

Example:

```json
{
  "q": "Ram"
}
```

---

# Dynamic Filters

Each filter has the following structure:

```json
{
  "fieldId": "name",
  "fieldType": "string",
  "condition": "contain",
  "value": "Ram"
}
```

## Filter Properties

| Property | Description |
|---|---|
| `fieldId` | Field to filter |
| `fieldType` | `string`, `number`, `date`, or `boolean` |
| `condition` | Comparison condition |
| `value` | Filter value when required |
| `inputType` | Optional input metadata |

---

# Filter Logic

Multiple filters can be combined using:

```json
{
  "logic": "AND"
}
```

or:

```json
{
  "logic": "OR"
}
```

Example:

```json
{
  "logic": "AND",
  "filters": [
    {
      "fieldId": "name",
      "fieldType": "string",
      "condition": "contain",
      "value": "Ram"
    },
    {
      "fieldId": "followUpDate",
      "fieldType": "date",
      "condition": "after",
      "value": "2026-08-01"
    }
  ]
}
```

---

# System Fields

The API supports filtering the following system fields:

- `name`
- `email`
- `assignedTo`
- `followUpDate`

---

# String Conditions

Supported conditions:

- `is`
- `is not`
- `contain`
- `does not contain`
- `starts with`
- `ends with`
- `is empty`
- `is not empty`

Example:

```json
{
  "fieldId": "name",
  "fieldType": "string",
  "condition": "starts with",
  "value": "Ra"
}
```

---

# Number Conditions

Supported conditions:

- `is`
- `is not`
- `greater than`
- `less than`

Example:

```json
{
  "fieldId": "custom-field-id",
  "fieldType": "number",
  "condition": "greater than",
  "value": "100"
}
```

---

# Date Conditions

Supported conditions:

- `is`
- `before`
- `after`
- `is empty`
- `is not empty`

Example:

```json
{
  "fieldId": "followUpDate",
  "fieldType": "date",
  "condition": "after",
  "value": "2026-08-01"
}
```

---

# Boolean Conditions

Supported conditions:

- `is`
- `is not`

Boolean values must be:

```text
true
false
```

Example:

```json
{
  "fieldId": "custom-field-id",
  "fieldType": "boolean",
  "condition": "is",
  "value": "true"
}
```

---

# Custom Fields

Custom fields are stored using an Entity-Attribute-Value style structure.

The API supports custom fields with these types:

- `string`
- `number`
- `date`
- `boolean`

Custom field filters are generated dynamically using parameterized SQL queries.

Example:

```json
{
  "fieldId": "11111111-1111-1111-1111-111111111111",
  "fieldType": "string",
  "condition": "is",
  "value": "Chennai"
}
```

---

# Example Request

```http
POST /api/v1/leads/query?page=1&limit=20&sortBy=createdAt&sortDirection=desc
```

Headers:

```http
x-tenant-id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
x-user-id: a0000000-0000-0000-0000-000000000001
x-user-role: admin
Content-Type: application/json
```

Body:

```json
{
  "q": "Ram",
  "logic": "AND",
  "filters": [
    {
      "fieldId": "name",
      "fieldType": "string",
      "condition": "contain",
      "value": "Ram"
    }
  ]
}
```

---

# Example Response

```json
{
  "status": "success",
  "message": "Leads fetched successfully",
  "data": [
    {
      "id": "lead-id",
      "tenant_id": "tenant-id",
      "user_id": "user-id",
      "name": "Ram Kumar",
      "phone": "9876543210",
      "email": "ram@example.com",
      "assigned_to": "user-id",
      "follow_up_date": "2026-08-10T00:00:00.000Z",
      "created_at": "2026-08-01T00:00:00.000Z",
      "updated_at": "2026-08-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalRecords": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

# Error Responses

## Missing Authentication Headers

```json
{
  "message": "Missing authentication headers"
}
```

## Invalid Role

```json
{
  "message": "Invalid role"
}
```

## Invalid Query Parameters

```json
{
  "message": "Invalid query parameters"
}
```

## Invalid Request Body

```json
{
  "message": "Invalid request body"
}
```

## Database Error

```json
{
  "message": "Failed to query leads"
}
```

---

# Validation

Request validation is handled using Zod.

The API validates:

- Pagination values
- Page limits
- Sort fields
- Sort directions
- Filter field types
- Filter conditions
- Required filter values
- Number values
- Boolean values
- Date values

---

# Security Considerations

The API uses:

- Parameterized PostgreSQL queries
- Controlled sorting fields
- Zod request validation
- Tenant-based data isolation
- Role-based access restrictions

These measures help reduce risks such as SQL injection and unauthorized cross-tenant access.

---

# Testing

Run all tests:

```bash
npm test
```

Current automated tests cover:

- Authentication validation
- Invalid role handling
- Query parameter validation
- Request body validation
- Lead access control
- Agent restrictions
- Free-text search
- Filter logic
- Pagination metadata
- Database error handling

Current result:

```text
Test Files: 4 passed
Tests: 22 passed
```

---

# Author

Thirumurugan
