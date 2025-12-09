import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import groups from '../backend/src/routes/groups'

const app = new Hono()

// app.use('/*', cors()) // CORS is not needed for same-origin requests via Vercel rewrites, and was causing crashes.

app.get('/', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.get('/api', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.route('/api/groups', groups)

app.get('/api/debug-db', async (c) => {
    // Dynamically import pool to avoid initialization issues if this file is imported elsewhere
    const { pool } = await import('../backend/src/db');

    const dbUrl = process.env.DATABASE_URL;
    const diagnostics = {
        env_var_present: !!dbUrl,
        env_var_length: dbUrl?.length || 0,
        db_connectivity: 'unknown',
        error: null as any,
        timestamp: new Date().toISOString()
    };

    try {
        console.log('[Debug-DB] Attempting connection...');
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
            // Don't expose full stack in production unless necessary, but helpful for debug
            stack: err.stack
        };
        return c.json(diagnostics, 500);
    }
});

export default handle(app)
