import "server-only";
import { MongoClient, type Db } from "mongodb";
import { getEnv } from "./env";

/**
 * MongoDB access layer: a single shared client (kept on globalThis for
 * hot-reload), used for feedback and recommendation data.
 */
const g = globalThis as unknown as { __canteenxMongo?: Promise<MongoClient> };

function getClient(): Promise<MongoClient> {
  if (!g.__canteenxMongo) {
    const env = getEnv();
    const client = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      ignoreUndefined: true, // an omitted optional field must stay omitted, not become null (the collection validator rejects null)
    });
    g.__canteenxMongo = client.connect().catch((err) => {
      g.__canteenxMongo = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return g.__canteenxMongo;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getClient();
  return client.db(getEnv().MONGODB_DB);
}
