import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import groups from '../backend/src/routes/groups'
import { Pool } from 'pg'; // Import pg directly
// import { pool } from '../backend/src/db' // Remove external import

const app = new Hono()

// --- INLINED DB CONNECTION FOR DEBUGGING ---
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('[API INLINE] CRITICAL: DATABASE_URL is not set!');
} else {
    console.log(`[API INLINE] DATABASE_URL is set (Length: ${dbUrl.length})`);
    // Print the host/port to verify (masking password)
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`[API INLINE] Connection String: ${maskedUrl}`);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }, // Critical for Supabase
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('[API INLINE] Pool Error:', err);
});
// -------------------------------------------

// app.use('/*', cors()) 

app.get('/', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.get('/api', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.route('/api/groups', groups)

app.get('/api/debug-db', async (c) => {
    const diagnostics = {
        env_var_present: !!dbUrl,
        env_var_length: dbUrl?.length || 0,
        connection_string_preview: dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@') : 'N/A',
        db_connectivity: 'unknown',
        error: null as any,
        timestamp: new Date().toISOString()
    };

    try {
        console.log('[Debug-DB] Attempting connection via INLINED pool...');
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        client.release();
        diagnostics.db_connectivity = 'success';
        return c.json({ ...diagnostics, now: res.rows[0].now });
    } catch (err: any) {
        console.error('[Debug-DB] Connection failed:', err);
        diagnostics.db_connectivity = 'failed';
        diagnostics.error = {
            message: err.message,
            code: err.code,
            stack: err.stack
        };
        return c.json(diagnostics, 500);
    }
});

export default handle(app)
