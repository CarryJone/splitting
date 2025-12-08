import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import groups from '../backend/src/routes/groups'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.get('/api', (c) => {
    return c.text('Bill Splitter API is running!')
})

app.route('/api/groups', groups)

export default handle(app)
