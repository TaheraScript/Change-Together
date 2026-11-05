import { MongoClient, type Db } from "mongodb";

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
