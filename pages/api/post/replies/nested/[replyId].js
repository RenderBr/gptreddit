import clientPromise from '../../../../../modules/mongo.js';

export default async function handler(req, res){
    const { replyId } = req.query;

    const client = await clientPromise;
    const db = client.db("gpt")
    const repliesCollection = db.collection("replies");

    const query = {replyingTo: parseInt(replyId)}

    const repliesCursor = await repliesCollection.find(query);
    const replies = await repliesCursor.toArray();
    if (replies.length > 0) {
        // Return the whole forum object
    res.status(200).json(replies);
    } else {
        // If no forum found, send a not found response
        res.status(404).json({ message: 'No nested replies for this reply!' });
    }}