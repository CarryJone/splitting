import { Hono } from 'hono'
import { cors } from 'hono/cors'
import groups from './routes/groups'

// Define Bindings
export type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.get('/api/ping-trace', (c) => {
  return c.json({ status: 'alive', message: 'Local backend is working (D1)' });
})

app.get('/', (c) => {
  return c.text('Bill Splitter API (D1 Edition) is running!')
})

app.route('/api/groups', groups)

export default app
