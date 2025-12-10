import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

const getPool = () => {
    if (!pool) {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error('[DB] CRITICAL: DATABASE_URL is not set in environment variables!');
            throw new Error('DATABASE_URL is not set');
        }
        console.log(`[DB] Initializing pool. Database URL is SET (Length: ${dbUrl.length})`);
        pool = new Pool({
            connectionString: dbUrl,
            // ssl: { rejectUnauthorized: false }, // Let the connection string handle SSL (e.g. ?sslmode=require)
            connectionTimeoutMillis: 5000,
            max: 1, // Serverless best practice: limit connections
            idleTimeoutMillis: 1000 // Close idle connections quickly
        });

        pool.on('error', (err) => {
            console.error('[DB] Unexpected error on idle client', err);
        });
    }
    return pool;
};

export { getPool };

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        console.log(`[DB] Querying: ${text} | Params: ${JSON.stringify(params)}`);
        const res = await getPool().query(text, params);
        const duration = Date.now() - start;
        console.log(`[DB] Query executed in ${duration}ms | Rows: ${res.rowCount}`);
        return res;
    } catch (err) {
        console.error('[DB] Query Error:', err);
        throw err;
    }
};
