import { Hono } from 'hono'

// Native Handler containing Hono instantiation
export default function handler(req, res) {
    console.log('[DEBUG] Native Handler with Hono Import Hit!');

    try {
        const app = new Hono();
        console.log('[DEBUG] Hono instantiated successfully');

        res.status(200).json({
            status: 'alive',
            message: 'Hono loaded successfully within Native Handler',
            env: process.env.VERCEL ? 'Vercel' : 'Local'
        });
    } catch (e) {
        console.error('[DEBUG] Hono instantiation failed', e);
        res.status(500).json({ error: String(e) });
    }
}
