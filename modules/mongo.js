import config from '../config'

const { MongoClient } = require("mongodb");

const uri = `mongodb+srv://${config.mongo_username}:${config.mongo_password}@${config.mongo_host}/?retryWrites=true&w=majority`;

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}

let client;
let clientPromise;

client = new MongoClient(uri, options);
if(!global._mongoClientPromise){
  client = new MongoClient(uri,options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

let db = (await clientPromise).db(config.mongo_db);

export default db;