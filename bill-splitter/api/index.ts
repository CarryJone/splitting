import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import { Pool } from 'pg'

// Isolated Hono App with direct DB check
const app = new Hono()

app.get('/api/ping-trace', (c) => {
    return c.json({
        status: 'alive',
        message: 'Hono runtime is working',
        env: process.env.VERCEL ? 'Vercel' : 'Local'
    });
})

app.get('/api/debug-db', async (c) => {
    console.log('[DEBUG] Hono isolated debug-db called');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return c.json({ error: 'No DATABASE_URL' }, 500);

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
        max: 1 // Serverless friendly
    });

    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW() as now');
        client.release();
        await pool.end(); // close pool to let lambda finish clean
        return c.json({
            status: 'success',
            message: 'Hono + PG works strictly!',
            time: res.rows[0].now
        });
    } catch (err) {
        console.error('[DEBUG] Connection failed', err);
        return c.json({ error: String(err) }, 500);
    }
})

export default handle(app)

export const config = {
    runtime: 'nodejs',
};
