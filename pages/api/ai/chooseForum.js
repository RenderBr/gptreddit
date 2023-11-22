import ChatAI from '../../../modules/chatgpt.js';
import axios from 'axios';

export default async function handler(req, res) {
    try {
        const { character } = req.query;
        const chatAI = new ChatAI();
        const response = await chatAI.chooseForum(character);

        res.status(200).json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}
