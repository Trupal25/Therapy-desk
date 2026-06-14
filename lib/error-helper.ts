/**
 * Sanitizes an error message before returning it to the frontend.
 * If the error is a database-related error (contains SQL keywords, schema names, or "Failed query"),
 * it replaces it with a generic, safe error message to avoid leaking database schema/queries.
 */
export function sanitizeError(err: any, fallbackMessage: string): string {
  if (!err) return fallbackMessage;
  const msg = err.message || '';
  
  // Detect database errors
  const isDbError = 
    msg.includes('Failed query') || 
    msg.includes('select ') || 
    msg.includes('insert ') || 
    msg.includes('update ') || 
    msg.includes('delete ') || 
    msg.includes('where ') || 
    msg.includes('relation "') || 
    msg.includes('column "') || 
    msg.includes('drizzle') ||
    msg.includes('neon') ||
    msg.includes('postgresql') ||
    msg.includes('PGError') ||
    err.name === 'PgDatabaseError' ||
    err.code?.startsWith('23') || // Postgres integrity constraint violations
    err.code?.startsWith('08') || // Connection exceptions
    err.code?.startsWith('57');   // Operator intervention

  if (isDbError) {
    return 'A secure database error occurred. Please verify your database connection.';
  }

  return msg || fallbackMessage;
}
