-- =====================================================
-- Notifications Table
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    category VARCHAR(50) DEFAULT 'system' CHECK (category IN ('system', 'project', 'security', 'database')),
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own notifications
CREATE POLICY notifications_select_policy ON notifications
    FOR SELECT USING (user_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

-- RLS Policy: Users can update their own notifications (e.g., mark as read)
CREATE POLICY notifications_update_policy ON notifications
    FOR UPDATE USING (user_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

-- Index for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
