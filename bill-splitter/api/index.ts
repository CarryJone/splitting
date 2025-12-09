import app from '../backend/src/index';
// Import dependencies to ensure they are available
import { getPool } from '../backend/src/db/index';

// Manual Adapter:
// We accept the standard Vercel (req, res).
// We assume Vercel HAS parsed the body (default behavior).
// We manually construct a Request object and pass it to Hono.
export default async function handler(req, res) {
    try {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const url = new URL(req.url, `${protocol}://${host}`);

        // Reconstruct Headers
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
                value.forEach(v => headers.append(key, v as string));
            } else if (typeof value === 'string') {
                headers.append(key, value);
            }
        }

        // Handle Body: Check if Vercel already parsed it
        let body = null;
        const method = req.method.toUpperCase();

        if (method !== 'GET' && method !== 'HEAD') {
            if (req.body && typeof req.body === 'object') {
                // Vercel parsed it to object. We stringify it back for Hono.
                body = JSON.stringify(req.body);
                // Ensure Content-Type is set if missing (though usually it is)
                if (!headers.get('content-type')) {
                    headers.set('content-type', 'application/json');
                }
            } else if (typeof req.body === 'string') {
                body = req.body;
            }
            // If req.body is empty, we send null (or empty string/buffer depending on need)
        }

        const requestInit = {
            method: method,
            headers: headers,
            body: body
        };

        const webRequest = new Request(url.toString(), requestInit);

        // Dispatch to Hono
        const response = await app.fetch(webRequest);

        // Send Response back to Vercel
        res.status(response.status);

        // Copy headers (excluding transfer-encoding/connection which Node handles)
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() !== 'transfer-encoding') {
                res.setHeader(key, value);
            }
        });

        // Check content type to decide how to send body
        const responseContentType = response.headers.get('content-type');
        if (responseContentType && responseContentType.includes('application/json')) {
            const text = await response.text();
            res.send(text);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            res.send(Buffer.from(arrayBuffer));
        }

    } catch (error) {
        console.error('[Manual Adapter] Error:', error);
        res.status(500).json({ error: 'Internal Server Error (Adapter)', details: String(error) });
    }
}

// Ensure default config (bodyParser: true) is active so Vercel parses the JSON for us.
export const config = {
    runtime: 'nodejs',
};
