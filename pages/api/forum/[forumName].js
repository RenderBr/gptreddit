import clientPromise from '../../../modules/mongo.js';

export default async function handler(req, res){
    const { forumName } = req.query;

    const client = await clientPromise;
    const db = client.db("gpt")
    const forums = db.collection("forums")

    const query = {name: forumName}

    const forum = await forums.findOne(query);
    if (forum) {
        // Return the whole forum object
        res.status(200).json(forum);
    } else {
        // If no forum found, send a not found response
        res.status(404).json({ message: 'Forum not found' });
    }}