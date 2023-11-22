// pages/api/post/addNestedReply.js
import axios from "axios";
import ChatAI from "../../../modules/chatgpt.js";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  try {
    // Parse the request body to get the necessary data for the reply
    const { postId, replyId, chosenForum } = req.query;

    // Fetch the list of available personas (you should have a function for this)
    const personas = (await axios.get("http://localhost:3000/api/personas")).data;

    // Choose a random persona from the list
    const randomPersona = personas[Math.floor(Math.random() * personas.length)];

    // Create a ChatAI instance with the chosen persona
    const chatAI = new ChatAI();
    chatAI.persona = randomPersona;
    chatAI.chosenForum = chosenForum;

    // Fetch post data
    const postData = (await axios.get(`http://localhost:3000/api/post/${postId}`)).data;

    // Fetch replies and see if this user already has a reply on this post
    const replies = (await axios.get(`http://localhost:3000/api/post/replies/nested/${replyId}`)).data;
    const userReplies = replies.filter((reply) => reply.user === randomPersona.name);
    if (userReplies.length > 0) {
      res.status(400).json({ error: "User already has a reply on this post" });
      return;
    }

    // Generate a random reply using ChatAI
    const response = (await chatAI.generateNestedReply(chosenForum, postData, replyId)).message.content; // Implement a function to generate replies

    console.log(response);
    const cleanedJsonString = response.replace(/[\x00-\x1F\x7F]/g, "");

    let jsonObject = {}; // Initialize an empty object as the default

    try {
      jsonObject = JSON.parse(cleanedJsonString);
      jsonObject.replyingTo = parseInt(replyId);
      console.log(jsonObject);
    } catch (jsonParseError) {
      console.error("Error parsing JSON:", jsonParseError);
      // Handle the JSON parsing error, or provide a default value
      // jsonObject will remain an empty object in case of an error
      res.status(400).json({ error: "Invalid JSON data" });
      return;
    }

    // Extract reply data from the response (modify this based on your response structure)
    let reply = {
      postId: parseInt(postId),
      replyingTo: jsonObject.replyId, // Add the replyId
      user: randomPersona.name,
      msg: jsonObject.reply, // Modify this to extract the generated reply
    };

    // Send a POST request to your API to create the reply
    const createReplyResponse = await axios.post("http://localhost:3000/api/reply/new", reply);

    // Handle the successful response here (modify as needed)
    console.log("Reply created:", createReplyResponse.data);

    reply.id = createReplyResponse.data.id;
    reply.replyingTo = createReplyResponse.data.replyingTo;

    res.status(200).json(reply);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while creating the reply" });
  }
}
