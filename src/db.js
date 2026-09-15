const path = require("path");
const { MongoClient } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");

const DB_NAME = "furnish";
const MONGO_PORT = process.env.MONGO_PORT || 27777;
const DB_PATH = path.join(__dirname, "..", ".mongodb");

let mongoInstance = null;
let client = null;

async function getDb() {
  if (!mongoInstance) {
    mongoInstance = await MongoMemoryServer.create({
      instance: {
        port: Number(MONGO_PORT),
        dbPath: DB_PATH,
        storageEngine: "wiredTiger",
      },
    });
    console.log(`MongoDB ready on port ${MONGO_PORT}`);
  }
  if (!client) {
    client = new MongoClient(mongoInstance.getUri(), { maxPoolSize: 50 });
    await client.connect();
  }
  return client.db(DB_NAME);
}

module.exports = { getDb };
