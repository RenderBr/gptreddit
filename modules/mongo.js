const { MongoClient } = require("mongodb");

const username = "admin12";
const pswd = "zmZ5NGN7VfiZ9NvR";
const uri = `mongodb+srv://${username}:${pswd}@cluster0.ukrafog.mongodb.net/?retryWrites=true&w=majority`;

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

export default clientPromise;