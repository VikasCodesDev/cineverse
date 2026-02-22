// lib/mongodb.ts
// MongoDB connection utility with connection pooling (serverless-safe)
import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('Please add MONGODB_URI to your environment variables (.env.local or deployment config).');
  }
  // In serverless (Vercel, Render), reuse connection via global to avoid multiple connections per cold start
  if (global._mongoClientPromise) {
    return global._mongoClientPromise;
  }
  if (clientPromise) {
    return clientPromise;
  }
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
  return clientPromise;
}

// Lazy promise: only created when first used (avoids build-time connection)
export default getClientPromise;

export async function getDatabase() {
  const client = await getClientPromise();
  return client.db('cineverse');
}

export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}
