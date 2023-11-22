import clientPromise from '../../../modules/mongo.js';

export default async function handler(req, res){
    const { userName } = req.query;

    const client = await clientPromise;
    const db = client.db("gpt")
    const users = db.collection("users")

    const query = {name: userName}

    const user = await users.findOne(query);
    if (user) {
        // Return the whole forum object
        res.status(200).json(user);
    } else {
        // If no forum found, send a not found response
        res.status(404).json({ message: 'User not found' });
    }}