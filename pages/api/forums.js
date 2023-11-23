import db from '../../modules/mongo.js';

export default async function handler(req, res){
    const forums = db.collection("forums")

    const query = {}

    const forumsCursor = await forums.find(query);
    const replies = await forumsCursor.toArray();
   
   
    if (replies.length > 0) {
        // Return the whole forum object
    res.status(200).json(replies);
    } else {
        // If no forum found, send a not found response
        res.status(404).json({ message: 'No replies for this post!' });
    }}