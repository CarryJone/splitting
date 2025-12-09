import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('[DB] CRITICAL: DATABASE_URL is not set in environment variables!');
} else {
    console.log(`[DB] Initializing pool. Database URL is SET (Length: ${dbUrl.length})`);
}

export const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000 // Fail fast if connection hangs
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err);
});

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        console.log(`[DB] Querying: ${text} | Params: ${JSON.stringify(params)}`);
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`[DB] Query executed in ${duration}ms | Rows: ${res.rowCount}`);
        return res;
    } catch (err) {
        console.error('[DB] Query Error:', err);
        throw err;
    }
};
