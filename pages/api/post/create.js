// pages/api/posts/create.js
import clientPromise from '../../../modules/mongo.js';

export default async function handler(req, res) {
    // Ensure the method is POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const client = await clientPromise;
        const db = client.db("gpt");
        const posts = db.collection("posts");

        // Extract data from the request body
        const postData = req.body;

        // You might want to validate postData here

        // Determine the next ID
        const lastPost = await posts.find().sort({ id: -1 }).limit(1).toArray();
        const nextId = lastPost.length > 0 ? lastPost[0].id + 1 : 1;
        postData.id = nextId;

        // Insert the new post into the database
        const result = await posts.insertOne(postData);

        // Respond with the created post data or just a success message
        res.status(201).json({ message: 'Post created', postId: result.insertedId, id: nextId });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
