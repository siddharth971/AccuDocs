# Task Manager / Work Tracker - Implementation Guide

## Overview

The Task Manager is a comprehensive work tracking system for AccuDocs that enables team members to create, manage, and organize tasks within a Kanban-style interface. The system supports task prioritization, status tracking, due date management, and client association.

## Backend Implementation

### 1. Database Model - Task

**File:** `backend/src/models/task.model.ts`

The Task model defines the structure for all task-related data:

- **id**: UUID primary key
- **title**: Required string field for task name
- **description**: Optional text field for detailed task information
- **clientId**: Foreign key to Client (optional, for client-specific tasks)
- **assignedTo**: Foreign key to User (optional, for task assignment)
- **createdBy**: Foreign key to User (required, tracks task creator)
- **priority**: Enum ('high' | 'medium' | 'low'), defaults to 'medium'
- **status**: Enum ('todo' | 'in-progress' | 'review' | 'done'), defaults to 'todo'
- **dueDate**: Date field (optional)
- **tags**: JSON array of strings for categorization
- **completedAt**: Auto-set when status becomes 'done'
- **createdAt, updatedAt, deletedAt**: Timestamps with soft delete support

**Associations:**

- `belongsTo User` (createdBy)
- `belongsTo User` (assignedTo as assignee)
- `belongsTo Client`

### 2. Repository - Task Repository

**File:** `backend/src/repositories/task.repository.ts`

Provides data access layer with the following methods:

- `findById(id)`: Get single task with all associations
- `findAll(filters, pagination)`: Get paginated tasks with filtering
- `create(data)`: Create new task
- `update(id, data)`: Update task (handles automatic completedAt logic)
- `updateStatus(id, status)`: Update status only (for Kanban drag-drop)
- `delete(id)`: Soft delete task
- `getStats()`: Get dashboard statistics
- `getTasksByClientId(clientId)`: Get tasks for a specific client
- `getTasksByUserId(userId)`: Get tasks created or assigned to a user
- `getOverdueTasks()`: Get tasks past due date
- `getDueTodayTasks()`: Get tasks due today
- `getUrgentTasks(limit)`: Get high-priority tasks

### 3. Service - Task Service

**File:** `backend/src/services/task.service.ts`

Business logic layer handling:

- **getTasks()**: Filtered and paginated task retrieval
- **getTaskById()**: Single task retrieval
- **createTask()**: Task creation with audit logging
- **updateTask()**: Task update with auto-completion logic
- **updateTaskStatus()**: Kanban status updates
- **deleteTask()**: Task deletion with audit logging
- **getTaskStats()**: Dashboard statistics
- **getTasksByClient()**: Client-specific tasks
- **getTasksByUser()**: User's tasks
- **getOverdueTasks()**: Overdue task retrieval
- **getDueTodayTasks()**: Today's tasks
- **getUrgentTasks()**: Priority-based urgent tasks

The service automatically sets `completedAt` when task status changes to 'done' and clears it if reverted.

### 4. Controller - Task Controller

**File:** `backend/src/controllers/task.controller.ts`

HTTP request handlers:

```
GET    /tasks              - List tasks (with filters)
GET    /tasks/stats        - Dashboard statistics
GET    /tasks/urgent       - Urgent tasks
GET    /tasks/my-tasks     - Current user's tasks
GET    /tasks/client/:id   - Client's tasks
GET    /tasks/:id          - Single task
POST   /tasks              - Create task
PUT    /tasks/:id          - Update task
PATCH  /tasks/:id/status   - Update status only
DELETE /tasks/:id          - Delete task
```

### 5. Routes - Task Routes

**File:** `backend/src/routes/task.routes.ts`

All routes protected by `authenticate` middleware. Includes comprehensive Swagger documentation for API discovery.

### 6. Audit Logging

Task actions are logged with the following events:

- `TASK_CREATED`: When a task is created
- `TASK_UPDATED`: When a task is modified
- `TASK_STATUS_UPDATED`: When status changes (for kanban)
- `TASK_DELETED`: When a task is deleted

All logs include user ID, description, entity ID, IP address, and timestamp.

## Frontend Implementation

### 1. Task Model / Interface

**File:** `frontend/src/app/models/task.model.ts`

TypeScript interfaces mirroring the backend model:

- `Task`: Full task object
- `CreateTaskDto`: DTO for creating tasks
- `UpdateTaskDto`: DTO for updating tasks
- `UpdateTaskStatusDto`: DTO for status-only updates
- `TaskStats`: Statistics interface
- `PaginatedResponse<T>`: Generic pagination wrapper

### 2. Task Service

**File:** `frontend/src/app/core/services/task.service.ts`

Angular service providing HTTP methods:

```typescript
getTasks(page, limit, filters, sortBy, sortOrder);
getTaskStats();
getUrgentTasks(limit);
getTask(id);
getMyTasks();
getTasksByClient(clientId);
createTask(task);
updateTask(id, task);
updateTaskStatus(id, status);
deleteTask(id);
```

### 3. Kanban Board Component

**File:** `frontend/src/app/features/tasks/kanban-board/kanban-board.component.ts`

Main task management view with:

- **4 Droppable Columns**: To Do, In Progress, Review, Done
- **Drag & Drop**: Uses Angular CDK drag-drop with automatic status updates
- **Task Cards** displaying:
  - Title and priority badge (color-coded: red/yellow/green)
  - Client name
  - Assignee name
  - Due date (red if overdue)
  - Tags
  - Quick action menu (edit/delete)
- **Quick Add Button**: Per column for quick task creation
- **Header Statistics**: Task count per column
- **Real-time Updates**: Loads tasks on initialization

#### Priority Colors:

- High: Red (#ef4444)
- Medium: Yellow/Amber (#f59e0b)
- Low: Green (#22c55e)

#### Status Indicators:

- To Do: Slate gray
- In Progress: Blue
- In Review: Yellow
- Done: Green

### 4. Task List Component

**File:** `frontend/src/app/features/tasks/task-list/task-list.component.ts`

Table/list view with:

- **Filterable Columns**:
  - Title (searchable)
  - Client
  - Priority
  - Status
  - Due Date (red if overdue)
  - Assigned To
- **Filter Bar** for:
  - Text search
  - Status filter
  - Priority filter
  - Sort by (createdAt, dueDate, priority, title)
  - Sort order (ascending/descending)
- **Pagination**: 10, 25, 50, 100 items per page
- **Quick Actions**: Edit and delete per row

### 5. Task Form Component (Modal)

**File:** `frontend/src/app/features/tasks/task-form/task-form.component.ts`

Modal form for creating and editing tasks with:

- **Fields**:
  - Title (required)
  - Description (textarea)
  - Client (dropdown from API)
  - Assigned To (dropdown from users)
  - Priority (radio buttons)
  - Status (radio buttons)
  - Due Date (date picker)
  - Tags (chip input with add/remove)
- **Mode Detection**: Auto-loads existing task or creates new
- **Two-way Binding**: Using `[(visible)]` for modal state
- **Validation**: Required field validation
- **Output Event**: Emits `onSave` for parent component refresh

### 6. Tasks Widget (Dashboard)

**File:** `frontend/src/app/features/dashboard/widgets/tasks-widget.component.ts`

Dashboard widget displaying:

- **Key Metrics**:
  - Tasks due today (blue)
  - Overdue tasks (red)
  - Total tasks (slate)
- **Status Breakdown**: Visual progress bars for each status
- **Quick Navigation**: Link to full tasks page

### 7. Routes

**File:** `frontend/src/app/features/tasks/tasks.routes.ts`

```
/tasks          → Kanban board (default view)
/tasks/list     → List view
```

Integrated into main app routes at `/tasks` with auth guard.

### 8. Sidebar Navigation

Updated `sidebar.component.ts` to include Tasks link with `heroListBulletSolid` icon, accessible to all users (not admin-only).

### 9. Client Detail Integration

Added "Add Task" button to client detail page that:

- Pre-fills `clientId` when opened from client context
- Uses quick task form modal
- Closes after successful creation

## API Endpoints

### Query Parameters

#### Common Filters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in title/description
- `sortBy`: Field to sort by
- `sortOrder`: 'asc' or 'desc'

#### Task-Specific Filters

- `status`: 'todo', 'in-progress', 'review', 'done'
- `priority`: 'high', 'medium', 'low'
- `clientId`: Filter by client
- `assignedTo`: Filter by assignee
- `dueDateFrom`: Start date for range
- `dueDateTo`: End date for range
- `createdBy`: Filter by creator

### Response Format

All responses follow the standard API format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* content */
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Features

### Task Creation

- Quick add from column header
- Full form modal with all fields
- Pre-filled client when created from client page
- Auto-assigned creator

### Task Management

- Edit any task field
- Change status via drag-drop or form
- Delete with confirmation
- Auto-complete with date tracking

### Kanban Board

- Drag-drop between columns
- Real-time status update via API
- Visual priority indicators
- Overdue date highlighting
- Client and assignee quick view

### List View

- Sortable columns
- Advanced filtering
- Pagination
- Bulk actions (via context menu)

### Statistics

- Dashboard widget with key metrics
- Due today count
- Overdue count
- Status breakdown with percentages
- Total tasks count

### Audit Trail

- All task changes logged
- User tracking (creator, modifier)
- Timestamp tracking
- IP logging for security

## Usage Examples

### Backend - Create a Task

```typescript
const task = await taskService.createTask(
  {
    title: "Review Q1 financials",
    description: "Comprehensive review of Q1 results",
    clientId: "client-uuid",
    priority: "high",
    status: "todo",
    dueDate: new Date("2026-03-31"),
    tags: ["finance", "urgent"],
  },
  userId,
  ipAddress,
);
```

### Backend - Get Filtered Tasks

```typescript
const { tasks, total } = await taskService.getTasks(
  {
    status: "high",
    clientId: "client-uuid",
    dueDateFrom: new Date("2026-03-01"),
    dueDateTo: new Date("2026-03-31"),
  },
  { page: 1, limit: 10, sortBy: "dueDate", sortOrder: "asc" },
);
```

### Frontend - Load Tasks

```typescript
// In component
ngOnInit() {
  this.taskService.getTasks(1, 10, { status: 'todo' }).subscribe(response => {
    this.tasks = response.data;
    this.total = response.meta.total;
  });
}
```

### Frontend - Update Task Status (Kanban)

```typescript
onTaskDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
  const task = event.item.data;
  this.taskService.updateTaskStatus(task.id, newStatus).subscribe(
    () => this.loadTasks()
  );
}
```

## Testing Checklist

- [ ] Create task from Kanban board
- [ ] Create task from client detail page
- [ ] Edit task via modal
- [ ] Delete task with confirmation
- [ ] Drag task between columns
- [ ] Filter tasks by status
- [ ] Filter tasks by priority
- [ ] Search tasks by title
- [ ] Sort by due date
- [ ] View overdue tasks (red highlighting)
- [ ] Check dashboard widget statistics
- [ ] Verify audit logs for task changes
- [ ] Test pagination in list view
- [ ] Verify date picker for due dates
- [ ] Add/remove tags
- [ ] Verify client pre-fill on quick add

## Database Migration

For existing databases, create a migration to add the tasks table:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id),
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'todo',
  due_date TIMESTAMP,
  tags JSONB DEFAULT '[]',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  CONSTRAINT priority_check CHECK (priority IN ('high', 'medium', 'low')),
  CONSTRAINT status_check CHECK (status IN ('todo', 'in-progress', 'review', 'done'))
);

CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at) WHERE deleted_at IS NULL;
```

## Performance Considerations

- Tasks use UUID primary keys for consistency
- Indexes on frequently queried columns (status, priority, due_date)
- Soft delete support with `deleted_at` field
- Paginated listings to prevent large data transfers
- Client/User associations eagerly loaded to reduce N+1 queries
- Statistics computed at database level for efficiency

## Security

- All task endpoints require authentication
- User can only see tasks they created or tasks assigned to them (implement in service if needed)
- Audit logging tracks all modifications
- IP logging for security monitoring
- Soft deletes prevent data loss

## Future Enhancements

- Task templates/recurring tasks
- Task dependencies/subtasks
- Comments/discussion on tasks
- Task time tracking
- Task attachments
- Bulk task operations
- Email notifications for due dates
- Calendar view integration
- Task export (CSV/PDF)
- Custom fields/metadata
