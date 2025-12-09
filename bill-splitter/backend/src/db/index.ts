import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
console.log(`[DB] Initializing pool. Database URL is ${dbUrl ? 'SET' : 'MISSING'}`);

export const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
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
