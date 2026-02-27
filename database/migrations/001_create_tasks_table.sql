-- Task Manager Migration
-- Creates the tasks table and related indexes for the Work Tracker feature

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  due_date TIMESTAMP WITH TIME ZONE,
  tags JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT priority_check CHECK (priority IN ('high', 'medium', 'low')),
  CONSTRAINT status_check CHECK (status IN ('todo', 'in-progress', 'review', 'done'))
);

-- Create indexes for performance
CREATE INDEX idx_tasks_client_id ON tasks(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_created_by ON tasks(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_priority ON tasks(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
CREATE INDEX idx_tasks_created_at ON tasks(created_at) WHERE deleted_at IS NULL;

-- Create composite indexes for common queries
CREATE INDEX idx_tasks_client_status ON tasks(client_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_priority_due ON tasks(priority, due_date) WHERE deleted_at IS NULL AND status != 'done';

-- Add comments for documentation
COMMENT ON TABLE tasks IS 'Task/Work Tracker for AccuDocs - stores all task/work items';
COMMENT ON COLUMN tasks.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN tasks.title IS 'Task title/name (required)';
COMMENT ON COLUMN tasks.description IS 'Detailed task description (optional)';
COMMENT ON COLUMN tasks.client_id IS 'Associated client (optional)';
COMMENT ON COLUMN tasks.assigned_to IS 'User assigned to task (optional)';
COMMENT ON COLUMN tasks.created_by IS 'User who created task (required)';
COMMENT ON COLUMN tasks.priority IS 'Task priority: high, medium, low';
COMMENT ON COLUMN tasks.status IS 'Task status: todo, in-progress, review, done';
COMMENT ON COLUMN tasks.due_date IS 'Due date for task completion';
COMMENT ON COLUMN tasks.tags IS 'JSON array of tags for categorization';
COMMENT ON COLUMN tasks.completed_at IS 'Timestamp when task marked done (auto-set)';
COMMENT ON COLUMN tasks.deleted_at IS 'Soft delete timestamp';

-- Optional: Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_update_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_updated_at();

-- Optional: Create view for active tasks
CREATE OR REPLACE VIEW active_tasks AS
SELECT * FROM tasks WHERE deleted_at IS NULL;

-- Optional: Create view for urgent tasks
CREATE OR REPLACE VIEW urgent_tasks AS
SELECT * FROM tasks
WHERE deleted_at IS NULL
  AND status != 'done'
  AND (priority = 'high' OR (due_date IS NOT NULL AND due_date < CURRENT_TIMESTAMP + INTERVAL '3 days'))
ORDER BY priority DESC, due_date ASC;

-- Optional: Create view for overdue tasks
CREATE OR REPLACE VIEW overdue_tasks AS
SELECT * FROM tasks
WHERE deleted_at IS NULL
  AND status != 'done'
  AND due_date IS NOT NULL
  AND due_date < CURRENT_DATE
ORDER BY due_date ASC;

-- Grant permissions (adjust based on your role setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO "app_user";
-- GRANT USAGE ON SCHEMA public TO "app_user";
