import clientPromise from '../../../../modules/mongo.js';

export default async function handler(req, res){
    const { postId } = req.query;

    const client = await clientPromise;
    const db = client.db("gpt")
    const posts = db.collection("posts")
    const repliesCollection = db.collection("replies");

    const query = {postId: parseInt(postId), replyingTo: null}

    const repliesCursor = await repliesCollection.find(query).sort({ _id: -1 });
    const replies = await repliesCursor.toArray();
    if (replies.length > 0) {
        // Return the whole forum object
        res.status(200).json(replies);
    } else {
        // If no forum found, send a not found response
        res.status(200).json([]);
    }
}
