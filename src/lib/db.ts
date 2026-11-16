import "server-only";
import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { getEnv } from "./env";

/**
 * MySQL access layer. One connection pool is shared by the whole app
 * (kept on globalThis so hot-reload in development does not open a new
 * pool every time). All SQL uses placeholders (?), never string
 * concatenation, which prevents SQL injection.
 */
const g = globalThis as unknown as { __canteenxPool?: Pool };

export function getPool(): Pool {
  if (!g.__canteenxPool) {
    const env = getEnv();
    g.__canteenxPool = mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true, // DECIMAL columns (prices) come back as numbers, not strings
    });
  }
  return g.__canteenxPool;
}

/** SELECT: returns rows. */
export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: Array<string | number | boolean | Date | null> = [],
): Promise<T[]> {
  const [rows] = await getPool().execute<T[]>(sql, params);
  return rows;
}

/** INSERT / UPDATE / DELETE: returns affectedRows / insertId. */
export async function execute(
  sql: string,
  params: Array<string | number | boolean | Date | null> = [],
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

/**
 * Runs `fn` inside a transaction on one connection: COMMIT if it
 * resolves, ROLLBACK if it throws.
 */
export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
