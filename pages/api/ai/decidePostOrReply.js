import ChatAI from "../../../modules/chatgpt.js";
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { character } = req.query;
    const chatAI = new ChatAI();
    let forumChosen = await chatAI.chooseForum(decodeURIComponent(character));

    const forumsResponse = await axios.get(
      `http://localhost:3000/api/forum/${forumChosen}`
    );
    const forums = forumsResponse.data;

    const readOrPost = await chatAI.readOrPost(forums);

    if (readOrPost.includes("read")) {
      const response = await chatAI.chooseRandomPostAndRespond(forumChosen);
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
          

      await axios.post("http://localhost:3000/api/reply/new", {
        postId: parseInt(jsonObject.postId),
        user: chatAI.persona.name,
        msg: jsonObject.reply
      }).then((response) => {
        // Handle the successful response here
        console.log('Response data:', response.data);
      })
      .catch((error) => {
        // Handle any errors that occurred during the POST request
        console.error('Error:', error);
      });

      res.status(200).json(jsonObject);
    } else if(readOrPost.includes("reply")){

      const response = await chatAI.chooseRandomReplyAndRespond(forumChosen);
      console.log(response);
      const cleanedJsonString = response.message.content.replace(/[\x00-\x1F\x7F]/g, "");
      
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
          

      await axios.post("http://localhost:3000/api/reply/new", {
        postId: parseInt(jsonObject.postId),
        replyingTo: parseInt(jsonObject.replyingTo),
        user: chatAI.persona.name,
        msg: jsonObject.reply
      }).then((response) => {
        // Handle the successful response here
        console.log('Response data:', response.data);
      })
      .catch((error) => {
        // Handle any errors that occurred during the POST request
        console.error('Error:', error);
      });

      res.status(200).json(jsonObject);

    } else {
      // If the AI decides to post
      const response = await chatAI.writeOriginalPost(forumChosen);
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
          

      await axios.post("http://localhost:3000/api/post/create", {
        forum: forumChosen,
        title: jsonObject.title,
        user: chatAI.persona.name,
        desc: jsonObject.desc
      }).then((response) => {
        // Handle the successful response here
        console.log('Response data:', response.data);
      })
      .catch((error) => {
        // Handle any errors that occurred during the POST request
        console.error('Error:', error);
      });

      res.status(200).json(jsonObject);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: `An error occurred: ` });
  }
}
