import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Attempting to connect to database...');
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to database!');

        const res = await client.query('SELECT NOW()');
        console.log('Current Database Time:', res.rows[0].now);

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Connection Error:', err);
    }
}

testConnection();
