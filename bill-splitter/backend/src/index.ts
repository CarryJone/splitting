import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import groups from './routes/groups'

const app = new Hono()

if (process.env.NODE_ENV !== 'production') {
  app.use('/*', cors())
}

app.get('/api/ping-trace', (c) => {
  return c.json({ status: 'alive', message: 'Local backend is working' });
})

app.get('/', (c) => {
  return c.text('Bill Splitter API is running!')
})

app.route('/api/groups', groups)

const port = 3000

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  console.log(`Server is running on port ${port}`)
  serve({
    fetch: app.fetch,
    port
  })
}

export default app
