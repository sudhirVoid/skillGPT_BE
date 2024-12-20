import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, DATABASEURL } from '../constants/constants';

const pool = new Pool(
    {
      connectionString: DATABASEURL
    }
  )
  
export async function executeQuery(query: string){
    let result = await pool.query(query)
    return result.rows;
}