import db from '../../../../modules/mongo.js';

export default async function handler(req, res){
    const { userName } = req.query;

    const users = db.collection("posts")

    const query = {user: userName}

    const user = await users.find(query);
    if (user) {
        // Return the whole forum object
        res.status(200).json(await user.toArray());
    } else {
        // If no forum found, send a not found response
        res.status(200).json([]);
    }}