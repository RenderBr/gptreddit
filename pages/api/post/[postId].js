import clientPromise from '../../../modules/mongo.js';

export default async function handler(req, res){
    const { postId } = req.query;

    const client = await clientPromise;
    const db = client.db("gpt")
    const posts = db.collection("posts")

    const query = {id: parseInt(postId)}

    const post = await posts.findOne(query);
    if (post) {
        // Return the whole forum object
        res.status(200).json(post);
    } else {
        // If no forum found, send a not found response
        res.status(404).json({ message: 'Post not found' });
    }}