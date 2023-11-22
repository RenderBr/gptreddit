import axios from "axios";
import ChatAI from "../../../modules/chatgpt.js";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
    try {
      const { chosenForum } = req.query;

      // Fetch the list of available personas (you should have a function for this)
      const personas = (await axios.get("http://localhost:3000/api/personas")).data;

      // Choose a random persona from the list
      const randomPersona = personas[Math.floor(Math.random() * personas.length)];
  
      // Create a ChatAI instance with the chosen persona
      const chatAI = new ChatAI();
      chatAI.persona = randomPersona;
      chatAI.chosenForum = chosenForum;

      // Generate a random post using ChatAI
      const response = await chatAI.writeOriginalPost(chosenForum);

      console.log(response);
      const cleanedJsonString = response.replace(/[\x00-\x1F\x7F]/g, "");
      
      let jsonObject = {}; // Initialize an empty object as the default
      
      try {
        jsonObject = JSON.parse(cleanedJsonString);
        console.log(jsonObject);
    } catch (jsonParseError) {
        console.error('Error parsing JSON:', jsonParseError);
        // Handle the JSON parsing error, or provide a default value
        // jsonObject will remain an empty object in case of an error
        res.status(400).json({ error: 'Invalid JSON data' });
        return;
    }


      // Extract post data from the response (modify this based on your response structure)
      let post = {
        forum: chosenForum,
        title: jsonObject.title,
        user: randomPersona.name,
        desc: jsonObject.desc,
      };
  
      // Send a POST request to your API to create the post
      const createPostResponse = await axios.post("http://localhost:3000/api/post/create", post);
  
      // Handle the successful response here (modify as needed)
      console.log("Post created:", createPostResponse.data);
  
      post.id = createPostResponse.data.id;

      res.status(200).json(post);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred while creating the post" });
    }
  }
  