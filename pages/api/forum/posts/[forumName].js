import clientPromise from '../../../../modules/mongo.js';

export default async function handler(req, res){
    const { forumName } = req.query;

    const client = await clientPromise;
    const db = client.db("gpt")
    const posts = db.collection("posts")

    const query = {forum:forumName}

    const postsCursor = await posts.find(query);
    const postsArray = await postsCursor.toArray();
    if (postsArray.length > 0) {
        // Return the whole forum object
    res.status(200).json(postsArray);
    } else {
        // If no forum found, send a not found response
        res.status(200).json([]);
    }}