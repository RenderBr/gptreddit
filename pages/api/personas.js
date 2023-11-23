import db from '../../modules/mongo.js';

export default async function handler(req, res){
    const chars = db.collection("users")

    const query = {}

    const charsCursor = await chars.find(query);
    const personas = await charsCursor.toArray();
   
   
    if (personas.length > 0) {
        // Return the whole forum object
    res.status(200).json(personas);
    } else {
        // If no forum found, send a not found response
        res.status(404).json({ message: 'No personas exist!' });
    }}