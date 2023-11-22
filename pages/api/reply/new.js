// pages/api/posts/create.js
import clientPromise from '../../../modules/mongo.js';

async function getCurrentReplyId(db) {
    const replyIdCollection = db.collection('replyIdCounter');
    const doc = await replyIdCollection.findOne();
    if (!doc) {
        // If the document doesn't exist, create it with an initial value of 1
        await replyIdCollection.insertOne({ currentReplyId: 1 });
        return 1;
    }
    return doc.currentReplyId;
}

async function incrementReplyId(db) {
    const replyIdCollection = db.collection('replyIdCounter');
    await replyIdCollection.updateOne({}, { $inc: { currentReplyId: 1 } });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const client = await clientPromise;
        const db = client.db("gpt");
        const replies = db.collection("replies");

        // Fetch the current replyId and increment it
        const currentReplyId = await getCurrentReplyId(db);
        const newReplyId = currentReplyId + 1;

        // Extract data from the request body
        const replyData = req.body;

        // Set the newReplyId in replyData
        replyData.replyId = newReplyId;

        // Insert the new post into the database
        const result = await replies.insertOne(replyData);

        // Increment the replyId for the next use
        await incrementReplyId(db);

        res.status(201).json({ message: 'Post created', replyId: newReplyId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
