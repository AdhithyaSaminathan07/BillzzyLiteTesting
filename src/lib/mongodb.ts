// // src/lib/mongodb.ts

// import { MongoClient } from 'mongodb';
// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;

// // Add debugging to check the MongoDB URI
// console.log('MONGODB_URI from environment:', MONGODB_URI);

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable');
// }

// // Define a type for our Mongoose cache
// interface MongooseCache {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// const globalWithMongoose = global as typeof globalThis & {
//   mongoose?: MongooseCache;
// };

// const cached: MongooseCache = globalWithMongoose.mongoose || { conn: null, promise: null };

// if (!globalWithMongoose.mongoose) {
//   globalWithMongoose.mongoose = cached;
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     // Extract database name from URI
//     const uri = new URL(MONGODB_URI!);
//     const dbName = uri.pathname.substring(1) || 'billzzyDB'; // Default to billzzyDB if not specified
//     console.log('Connecting to MongoDB database:', dbName);

//     // Ensure the database name is explicitly set in the connection URI
//     let connectionUri = MONGODB_URI!;
//     if (!uri.pathname || uri.pathname === '/') {
//       connectionUri = `${MONGODB_URI!.replace(/\/$/, '')}/${dbName}`;
//     }

//     console.log('Using connection URI:', connectionUri);

//     // THIS IS THE FIX: We add '!' to tell TypeScript that MONGODB_URI is not undefined.
//     console.log('Connecting to MongoDB with URI:', connectionUri);
//     cached.promise = mongoose.connect(connectionUri, {
//       dbName: dbName // Explicitly specify the database name
//     }).then((mongooseInstance) => {
//       console.log('Connected to MongoDB database:', mongooseInstance.connection.name);
//       return mongooseInstance;
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// // --- This section is for the NextAuth adapter ---
// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// if (process.env.NODE_ENV === 'development') {
//   const globalWithMongo = global as typeof globalThis & {
//     _mongoClientPromise?: Promise<MongoClient>
//   }
//   if (!globalWithMongo._mongoClientPromise) {
//     // Extract database name from URI for the MongoClient as well
//     const uri = new URL(MONGODB_URI!);
//     const dbName = uri.pathname.substring(1) || 'billzzyDB';
//     console.log('MongoClient connecting to database:', dbName);

//     // Ensure the database name is explicitly set in the connection URI for MongoClient
//     let connectionUri = MONGODB_URI!;
//     if (!uri.pathname || uri.pathname === '/') {
//       connectionUri = `${MONGODB_URI!.replace(/\/$/, '')}/${dbName}`;
//     }

//     console.log('Creating MongoClient with URI:', connectionUri);
//     client = new MongoClient(connectionUri, {});
//     globalWithMongo._mongoClientPromise = client.connect();
//   }
//   clientPromise = globalWithMongo._mongoClientPromise;
// } else {
//   // Extract database name from URI for the MongoClient as well
//   const uri = new URL(MONGODB_URI!);
//   const dbName = uri.pathname.substring(1) || 'billzzyDB';
//   console.log('MongoClient connecting to database:', dbName);

//   // Ensure the database name is explicitly set in the connection URI for MongoClient
//   let connectionUri = MONGODB_URI!;
//   if (!uri.pathname || uri.pathname === '/') {
//     connectionUri = `${MONGODB_URI!.replace(/\/$/, '')}/${dbName}`;
//   }

//   console.log('Creating MongoClient with URI:', connectionUri);
//   client = new MongoClient(connectionUri, {});
//   clientPromise = client.connect();
// }

// export { clientPromise };
// export default dbConnect;

// src/lib/mongodb.ts

import { MongoClient, MongoClientOptions } from 'mongodb';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// --- OPTIMIZED CONFIGURATION FOR LIGHTSAIL/AWS ---
// These settings prevent the "stale connection" and 504 errors on AWS
const options: MongoClientOptions = {
  maxPoolSize: 10,                // Limit connections to save RAM (Crucial for Lightsail)
  serverSelectionTimeoutMS: 20000, // Fail fast (20s) instead of hanging indefinitely
  socketTimeoutMS: 60000,         // Close idle connections to prevent "Zombie" sockets
  family: 4                       // Force IPv4 to prevent AWS IPv6 lookup timeouts
};
// -------------------------------------------------

// Helper to handle DB Name extraction safely
const getDbConfig = (uriString: string) => {
  const uriObj = new URL(uriString);
  const dbName = uriObj.pathname.substring(1) || 'billzzyDB';
  return { uri: uriString, dbName };
}

// --- MONGOOSE CACHE (For Application Logic) ---
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose || { conn: null, promise: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const { uri, dbName } = getDbConfig(MONGODB_URI!);

    console.log(`Connecting to Mongoose [DB: ${dbName}]...`);

    const mongooseOpts = {
      ...options,
      dbName: dbName,
      bufferCommands: false,
    };

    // The FIX: We cast 'mongooseOpts' to 'mongoose.ConnectOptions' 
    // to resolve the TypeScript dependency mismatch.
    cached.promise = mongoose.connect(uri, mongooseOpts as mongoose.ConnectOptions).then((mongooseInstance) => {
      console.log('✅ Mongoose Connected');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on failure so we try again next time
    console.error("❌ Mongoose Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

// --- MONGOCLIENT (For NextAuth) ---
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const { uri } = getDbConfig(MONGODB_URI!);

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  if (!globalWithMongo._mongoClientPromise) {
    console.log('Initializing MongoClient (Dev)...');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // PRODUCTION MODE
  console.log('Initializing MongoClient (Prod)...');

  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error("❌ MongoDB Connection Failed:", err);
      throw err;
    });
}

export { clientPromise };
export default dbConnect;