import db from '../../../modules/mongo.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { postId, userId } = req.query;

    if (!postId || !userId) {
      return res.status(400).json({ error: 'Missing postId or userId' });
    }

    const replies = db.collection('replies');

    const query = {
        user: userId,
        postId: parseInt(postId),
    };
    // Check if the user has already replied to the specified post
    const existingReply = await replies.findOne(query);

    if (existingReply) {
      return res.status(200).json({ hasReplied: true });
    } else {
      return res.status(200).json({ hasReplied: false });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
}
