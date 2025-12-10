// import { serve } from '@hono/node-server' // Removed for Worker compatibility
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import groups from './routes/groups'

const app = new Hono()

app.use('/*', cors())

app.use('*', async (c, next) => {
  // Polyfill process.env for legacy node code compatibility in Workers
  if (c.env && (c.env as any).DATABASE_URL) {
    process.env.DATABASE_URL = (c.env as any).DATABASE_URL as string;
  }
  await next();
})

app.get('/api/ping-trace', (c) => {
  return c.json({ status: 'alive', message: 'Local backend is working' });
})

app.get('/', (c) => {
  return c.text('Bill Splitter API is running!')
})

app.route('/api/groups', groups)

const port = 3000

// Cloudflare Workers Entry Point
// The 'serve' from @hono/node-server is NOT needed for Workers.
// Workers runtime automatically detects the default export.

export default app


// export default app // Removed duplicate
