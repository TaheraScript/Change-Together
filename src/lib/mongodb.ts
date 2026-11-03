import { MongoClient, type Db } from "mongodb";

/*
 * A single MongoClient is reused across hot reloads (and across route
 * handlers) so we don't exhaust the Atlas connection pool. The promise is
 * cached on `globalThis` because Next.js re-evaluates modules in dev.
 */
const globalForMongo = globalThis as unknown as {
  _changeTogetherMongo?: Promise<MongoClient>;
};

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set."));
  }
  return new MongoClient(uri).connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo._changeTogetherMongo) {
    globalForMongo._changeTogetherMongo = connect().catch((error) => {
      // Let the next request retry instead of caching a rejected promise.
      globalForMongo._changeTogetherMongo = undefined;
      throw error;
    });
  }
  return globalForMongo._changeTogetherMongo;
}

export async function getDb(
  dbName = process.env.MONGODB_DB_NAME ?? "change-together",
): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
