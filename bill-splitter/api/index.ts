import { handle } from 'hono/vercel'
import { Hono } from 'hono'

// Standalone app to verify Vercel runtime
const app = new Hono()

app.get('/api/ping-trace', (c) => {
    return c.json({
        status: 'alive',
        message: 'Standalone API is working. Issue is in backend imports.'
    });
})

app.get('/api/debug-db', (c) => {
    return c.json({
        status: 'skipped',
        message: 'DB connection disabled for isolation test.'
    });
})

export default handle(app)

export const config = {
    runtime: 'nodejs',
};
