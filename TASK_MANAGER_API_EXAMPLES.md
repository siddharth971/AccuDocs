# Task Manager API - Request/Response Examples

## Environment

```
API Base URL: http://localhost:3000/api/v1
Authentication: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## CREATE TASK

### Request

```http
POST /tasks
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Review Q1 Financial Statements",
  "description": "Comprehensive review of all Q1 financial statements and reconcile with accounting records",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440001",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-03-31T23:59:59Z",
  "tags": ["finance", "q1", "urgent"]
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Review Q1 Financial Statements",
    "description": "Comprehensive review of all Q1 financial statements and reconcile with accounting records",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "status": "todo",
    "dueDate": "2026-03-31T23:59:59Z",
    "tags": ["finance", "q1", "urgent"],
    "completedAt": null,
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "ACME-001",
      "name": "ACME Corporation"
    },
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "John Manager",
      "email": "john@example.com"
    },
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Accountant",
      "email": "jane@example.com"
    },
    "createdAt": "2026-02-27T10:30:00Z",
    "updatedAt": "2026-02-27T10:30:00Z"
  }
}
```

---

## GET ALL TASKS (WITH FILTERS)

### Request - Basic

```http
GET /tasks?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request - With Filters

```http
GET /tasks?page=1&limit=10&status=in-progress&priority=high&sortBy=dueDate&sortOrder=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request - Advanced Filters

```http
GET /tasks?page=1&limit=25&clientId=550e8400-e29b-41d4-a716-446655440000&status=todo&dueDateFrom=2026-03-01&dueDateTo=2026-03-31&search=financial
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Review Q1 Financial Statements",
      "description": "Comprehensive review of all Q1 financial statements...",
      "clientId": "550e8400-e29b-41d4-a716-446655440000",
      "priority": "high",
      "status": "in-progress",
      "dueDate": "2026-03-31T23:59:59Z",
      "tags": ["finance", "q1"],
      "completedAt": null,
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "code": "ACME-001",
        "name": "ACME Corporation"
      },
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "John Manager",
        "email": "john@example.com"
      },
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Accountant",
        "email": "jane@example.com"
      },
      "createdAt": "2026-02-27T10:30:00Z",
      "updatedAt": "2026-02-27T11:45:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## GET TASK STATISTICS

### Request

```http
GET /tasks/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalTasks": 45,
    "dueTodayCount": 3,
    "overdueCount": 5,
    "byStatus": {
      "todo": 15,
      "in-progress": 12,
      "review": 10,
      "done": 8
    }
  }
}
```

---

## GET URGENT TASKS

### Request

```http
GET /tasks/urgent?limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Urgent tasks retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Review Q1 Financial Statements",
      "priority": "high",
      "status": "todo",
      "dueDate": "2026-03-05T23:59:59Z",
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "code": "ACME-001",
        "name": "ACME Corporation"
      },
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Accountant",
        "email": "jane@example.com"
      },
      "createdAt": "2026-02-27T10:30:00Z",
      "updatedAt": "2026-02-27T10:30:00Z"
    }
  ]
}
```

---

## GET SINGLE TASK

### Request

```http
GET /tasks/550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Review Q1 Financial Statements",
    "description": "Comprehensive review of all Q1 financial statements and reconcile with accounting records",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "status": "in-progress",
    "dueDate": "2026-03-31T23:59:59Z",
    "tags": ["finance", "q1", "urgent"],
    "completedAt": null,
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "ACME-001",
      "name": "ACME Corporation"
    },
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "John Manager",
      "email": "john@example.com"
    },
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Accountant",
      "email": "jane@example.com"
    },
    "createdAt": "2026-02-27T10:30:00Z",
    "updatedAt": "2026-02-27T11:45:00Z"
  }
}
```

---

## UPDATE TASK

### Request

```http
PUT /tasks/550e8400-e29b-41d4-a716-446655440002
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Review Q1 Financial Statements - Complete",
  "priority": "high",
  "status": "review",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440001",
  "tags": ["finance", "q1", "completed"]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Review Q1 Financial Statements - Complete",
    "description": "Comprehensive review of all Q1 financial statements and reconcile with accounting records",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "status": "review",
    "dueDate": "2026-03-31T23:59:59Z",
    "tags": ["finance", "q1", "completed"],
    "completedAt": null,
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "ACME-001",
      "name": "ACME Corporation"
    },
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "John Manager",
      "email": "john@example.com"
    },
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Accountant",
      "email": "jane@example.com"
    },
    "createdAt": "2026-02-27T10:30:00Z",
    "updatedAt": "2026-02-27T14:00:00Z"
  }
}
```

---

## UPDATE TASK STATUS (KANBAN DRAG-DROP)

### Request

```http
PATCH /tasks/550e8400-e29b-41d4-a716-446655440002/status
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "status": "done"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Review Q1 Financial Statements - Complete",
    "description": "Comprehensive review of all Q1 financial statements and reconcile with accounting records",
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "status": "done",
    "dueDate": "2026-03-31T23:59:59Z",
    "tags": ["finance", "q1", "completed"],
    "completedAt": "2026-02-27T14:15:00Z",
    "client": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "ACME-001",
      "name": "ACME Corporation"
    },
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "John Manager",
      "email": "john@example.com"
    },
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Accountant",
      "email": "jane@example.com"
    },
    "createdAt": "2026-02-27T10:30:00Z",
    "updatedAt": "2026-02-27T14:15:00Z"
  }
}
```

---

## DELETE TASK

### Request

```http
DELETE /tasks/550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (204 No Content)

```
[Empty body - just status code]
```

---

## ERROR RESPONSES

### 400 Bad Request

```json
{
  "success": false,
  "message": "Task title is required",
  "error": "BadRequestError"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Task not found",
  "error": "NotFoundError"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required",
  "error": "UnauthorizedError"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "InternalServerError"
}
```

---

## FILTER QUERY PARAMETERS

### Status Filter

```
&status=todo
&status=in-progress
&status=review
&status=done
```

### Priority Filter

```
&priority=high
&priority=medium
&priority=low
```

### Date Range Filter

```
&dueDateFrom=2026-03-01
&dueDateTo=2026-03-31
```

### Sorting

```
&sortBy=createdAt      (default)
&sortBy=dueDate
&sortBy=priority
&sortBy=title

&sortOrder=desc        (default)
&sortOrder=asc
```

### Pagination

```
&page=1
&limit=10
```

---

## CURL EXAMPLES

### Create Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review financials",
    "priority": "high",
    "status": "todo",
    "tags": ["finance"]
  }'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/v1/tasks?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter High Priority Tasks

```bash
curl "http://localhost:3000/api/v1/tasks?priority=high&status=todo&sortBy=dueDate&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Task Stats

```bash
curl http://localhost:3000/api/v1/tasks/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Task Status

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440002/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### Delete Task

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## POSTMAN EXAMPLES

See the Swagger API documentation at `/api/doc` for interactive testing.

All endpoints support the same authentication header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

**API Version:** v1  
**Last Updated:** February 27, 2026
