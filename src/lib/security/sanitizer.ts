import DOMPurify from 'dompurify'

/**
 * Sanitizes an input string to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous HTML tags and attributes.
 */
export function sanitizeInput(input: string): string {
    if (typeof window === 'undefined') {
        // Simple fallback for server-side if needed, though DOMPurify works best in DOM
        return input.replace(/[<>]/g, '')
    }
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // No HTML allowed for most inputs
        ALLOWED_ATTR: []
    })
}

/**
 * Sanitizes an object of inputs recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = Array.isArray(obj) ? [] : {}

    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitized[key] = sanitizeInput(obj[key])
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitized[key] = sanitizeObject(obj[key])
        } else {
            sanitized[key] = obj[key]
        }
    }

    return sanitized as T
}
