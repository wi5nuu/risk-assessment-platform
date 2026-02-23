import { createClient } from '@/lib/supabase/client'

export type SecurityAction =
    | 'LOGIN_FAILURE'
    | 'UNAUTHORIZED_ACCESS'
    | 'SENSITIVE_CHANGE'
    | 'SYSTEM_CONFIGURATION'
    | 'BOT_DETECTION'

export interface SecurityEvent {
    action: SecurityAction
    entity_type: string
    entity_id?: string
    old_values?: any
    new_values?: any
    ip_address?: string
    user_agent?: string
    user_id?: string
    organization_id?: string
}

/**
 * Log a security event to the audit_logs table
 */
export async function logSecurityEvent(event: SecurityEvent) {
    const supabase = createClient()

    try {
        // We use 'as any' for the table name to bypass tight Supabase generated type constraints 
        // that might not yet reflect the table structure in the local environment's types
        const { error } = await supabase
            .from('audit_logs' as any)
            .insert({
                action: event.action,
                entity_type: event.entity_type,
                entity_id: event.entity_id || null,
                old_values: event.old_values || null,
                new_values: event.new_values || null,
                ip_address: event.ip_address || null,
                user_agent: event.user_agent || null,
                user_id: event.user_id || null,
                organization_id: event.organization_id || null,
            } as any)

        if (error) {
            console.error('Failed to log security event:', error.message)
        }
    } catch (err) {
        console.error('Security Logger Exception:', err)
    }
}
