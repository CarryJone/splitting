import { handle } from 'hono/vercel'
import { Hono } from 'hono'
const app = new Hono()

// app.use('/*', cors()) // CORS is not needed for same-origin requests via Vercel rewrites, and was causing crashes.

app.get('/', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.get('/api', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.route('/api/groups', groups)

export default handle(app)
