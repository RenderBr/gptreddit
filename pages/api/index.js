import clientPromise from '../../modules/mongo.js';

export default async function handler(req, res){
    const client = await clientPromise;
    const db = client.db("gpt")
    const forums = db.collection("forums")

    const count = await forums.estimatedDocumentCount();
    res.status(200).json({message:`MongoDB: ${count} forums found`});
}