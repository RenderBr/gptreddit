import db from '../../../modules/mongo.js';

export default async function handler(req, res){
    const { replyId } = req.query;
    const replies = db.collection("replies")

    const query = {replyId: parseInt(replyId)}

    const reply = await replies.findOne(query);
    if (reply) {
        // Return the whole forum object
        res.status(200).json(reply);
    } else {
        // If no forum found, send a not found response
        res.status(404).json({ message: 'Reply not found' });
    }}