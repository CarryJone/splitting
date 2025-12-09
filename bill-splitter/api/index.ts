import { handle } from 'hono/vercel'
import { Hono } from 'hono'
// import { Pool } from 'pg' // REMOVED to isolate Hono

// Isolated Hono App (No DB Library)
const app = new Hono()

app.get('/api/ping-trace', (c) => {
    return c.json({
        status: 'alive',
        message: 'Hono framework is working (No PG)',
        env: process.env.VERCEL ? 'Vercel' : 'Local'
    });
})

app.get('/api/debug-db', (c) => {
    return c.json({
        status: 'skipped',
        message: 'DB library removed for isolation test.'
    });
})

export default handle(app)

export const config = {
    runtime: 'nodejs',
};
