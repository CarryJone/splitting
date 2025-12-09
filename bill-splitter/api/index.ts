import { handle } from 'hono/vercel'
import app from '../backend/src/index'
import { getPool } from '../backend/src/db/index'

// Re-using the official Hono Vercel adapter.
// Now that tsconfig.json is fixed, this should work correctly and handle Body parsing better than the generic node-server adapter.
const handler = handle(app)

// Mount debug route directly on the app (since we import the instance)
app.get('/api/ping-trace', (c) => {
    console.log('[DEBUG] Ping trace hit! (Hono Adapter)');
    return c.json({ status: 'alive', message: 'Routing is working (Hono Adapter)', env: process.env.VERCEL ? 'Vercel' : 'Local' });
});

app.get('/api/debug-db', async (c) => {
    const databaseUrl = process.env.DATABASE_URL || 'NOT_SET';
    const hiddenUrl = databaseUrl !== 'NOT_SET'
        ? `${databaseUrl.substring(0, 20)}...`
        : 'N/A';

    console.log(`[DEBUG] Handling request. DB_URL prefix: ${hiddenUrl}`);

    try {
        const start = Date.now();
        const client = await getPool().connect();
        try {
            const res = await client.query('SELECT NOW() as now');
            const duration = Date.now() - start;
            client.release();
            return c.json({
                status: 'success',
                message: 'Connected to DB',
                time: res.rows[0].now,
                duration: `${duration}ms`,
                env_check: hiddenUrl
            });
        } catch (queryErr) {
            client.release();
            console.error('[DEBUG] Query failed:', queryErr);
            return c.json({
                status: 'error',
                message: 'Query failed',
                error: String(queryErr)
            }, 500);
        }
    } catch (connErr) {
        console.error('[DEBUG] Connection failed:', connErr);
        return c.json({
            status: 'error',
            message: 'Connection failed',
            error: String(connErr),
            hint: 'Check IP Allowlist in Supabase'
        }, 500);
    }
})

export default handler

// We keep bodyParser disabled to allow Hono to handle the stream if possible.
// The adapter might override this, but it's good practice.
export const config = {
    runtime: 'nodejs',
    api: {
        bodyParser: false,
    },
};
