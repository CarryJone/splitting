export interface QueryResult {
    rows: any[];
    rowCount: number;
}

// Helper to provide a postgres-like query interface for D1
export const query = async (db: D1Database, text: string, params: any[] = []): Promise<QueryResult> => {
    const start = Date.now();
    try {
        console.log(`[D1] Querying: ${text} | Params: ${JSON.stringify(params)}`);

        // Convert Postgres-style $1, $2 params to SQLite ?
        // Note: This is a simple regex replacement. It might break if $1 is inside a string literal, 
        // but for this project's simple queries it should be fine.
        const sqliteText = text.replace(/\$\d+/g, '?');

        const stmt = db.prepare(sqliteText).bind(...params);
        const result = await stmt.all();

        const duration = Date.now() - start;
        console.log(`[D1] Query executed in ${duration}ms | Rows: ${result.results?.length}`);

        return {
            rows: result.results || [],
            rowCount: result.results?.length || 0
        };
    } catch (err) {
        console.error('[D1] Query Error:', err);
        throw err;
    }
};
