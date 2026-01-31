export function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for insecure contexts (like local IP access over HTTP)
    return btoa(Math.random().toString() + Date.now().toString()).substring(0, 12);
}
