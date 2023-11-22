import OpenAI from "openai";
import axios from "axios";

class ChatAI {
  constructor() {
    this.openai = new OpenAI({
      apiKey: "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",
    });
    this.messages = []; // Array to store messages
    this.persona;
  }

  async promptAI(prompt) {
    try {
      this.messages.push({ role: "system", content: prompt });

      const response = await this.openai.chat.completions.create({
        messages: this.messages,
        model: "gpt-3.5-turbo-16k-0613",
      });

      this.saveMessage({
        role: "assistant",
        content: response.choices[0].message.content,
      });

      return response.choices[0];
    } catch (error) {
      console.error(error);
    }
  }

  async getPersona(character) {
    if (this.persona) {
      return this.persona;
    }
    const userResponse = await axios.get(
      `http://localhost:3000/api/user/${character}`
    );
    this.persona = userResponse.data;
    return this.persona;
  }

async readOrPost(forum) {
    const randomNumber = Math.random();

    let aiResponse;

    if (randomNumber < 0.5) {
        aiResponse = await this.promptAI(
            `Based on the personality traits: ${JSON.stringify(this.persona)}, and considering your exploration of the '${forum.name}' forum, which focuses on '${forum.desc}', how would you like to engage? Would it align more with your personality to create a new post, read through existing discussions, or directly respond to an existing post or reply? Please indicate your preference by responding with 'post', 'read', or 'reply' only.`
        );
    } else {
        aiResponse = await this.promptAI(
            `Based on the personality traits: ${JSON.stringify(this.persona)}, and as you explore the '${forum.name}' forum which focuses on '${forum.desc}', consider stepping out of your comfort zone. 

            While it's natural to lean towards activities that align with your personality, this is an opportunity to diverge from the usual. Perhaps, if you're typically more of a reader, you might try creating a new post. Or if you're usually active in discussions, consider taking a step back to observe and read. 

            How would you like to engage in a way that's different from your usual approach? Please indicate your preference by responding with 'post', 'read', or 'reply', choosing an option that represents a new experience for you.`
        );
    }

    return aiResponse.message.content;
}

  async chooseForum(character) {
    const persona = this.getPersona(character);

    const forumsResponse = await axios.get("http://localhost:3000/api/forums");
    const forums = forumsResponse.data;

    const forumNames = forums.map((forum) => forum.name);

    const aiResponse = await this.promptAI(`Given these characteristics:
        ${JSON.stringify(
          persona
        )}, pick a forum that would interest you, but really it's random chance, just choose the name of the forum all lowercase, no spaces, don't say anything else:
        ${JSON.stringify(forumNames)}
        `);
    return aiResponse.message.content;
  }

  async fetchForumPosts(forumChosen){
      const forumPostsResponse = await axios.get(
        `http://localhost:3000/api/forum/posts/${forumChosen}`
      );
      const forumPosts = forumPostsResponse.data;
      return forumPosts;
  }

  async chooseRandomReplyAndRespond(forumChosen) {
    try {
      const forumPosts = await this.fetchForumPosts(forumChosen);
      if (!forumPosts || forumPosts.length === 0) return "No posts found in the forum to comment on.";
  
      let attempts = 0;
      const maxAttempts = 5; // A limit to prevent infinite loops
  
      while (attempts < maxAttempts) {
        const randomIndex = Math.floor(Math.random() * forumPosts.length);
        const randomPost = forumPosts[randomIndex];
  
        if (randomPost.user === this.persona.name) {
          attempts++;
          continue; // Skip if the post is by the AI persona
        }
  
        let replies = await this.fetchRepliesForPost(randomPost.id);
        replies = replies.filter(reply => reply.user !== this.persona.name);
  
        if (replies.length > 0) {
          const randomReply = replies[Math.floor(Math.random() * replies.length)];

          if(randomPost.user != this.persona.name){
          return await this.promptAI(`Based on your assigned persona: ${this.persona}, you are reading the post:
          
          ${randomPost.title} with the contents being: ${randomPost.desc}. You see a reply that catches your interest: 
          ${randomReply.msg}, this is posted by ${randomReply.user}. If you were this user, what would you respond with? 
          Encode your reply in JSON along with the following attributes: 'postId' which has a value of ${randomPost.id}, 'replyingTo' which has a value of ${randomReply.replyId}, and 'reply' which contains the contents of your response.
          Please do not include any linebreaks!
          `);
          }else{
                return await this.promptAI(
                    `Imagine you are a person with the following personality traits: ${JSON.stringify(
                      this.persona
                    )}. While browsing a post that you created on the '${forumChosen}' forum,
                    You are reading a reply someone left on your post: ${randomPost.title}. The replier is named ${randomReply.user} and the content is ${randomReply.msg}, how would you respond to this user? Just type out the response the character would make, encode with JSON and avoid using \\n outside of the 'reply', we only need two JSON attributes, one called 'reply' and 'postId', with this as the value: ${randomPost.id}`
                  );
          }


        } else {
          attempts++;
        }
      }
  
      return "No suitable replies found to respond to after several attempts.";
    } catch (error) {
      console.error("Error in chooseRandomReplyAndRespond:", error);
      throw error;
    }
  }
  
  async fetchRepliesForPost(postId){
    const response = await axios.get(`http://localhost:3000/api/post/replies/${postId}`);
    const repliesData = response.data;
    return repliesData;
}


  async chooseRandomPostAndRespond(forumChosen) {
    try {
      const forumPostsResponse = await axios.get(
        `http://localhost:3000/api/forum/posts/${forumChosen}`
      );
      const forumPosts = forumPostsResponse.data;
  
      // Check if there are posts in the array
      if (forumPosts.length === 0) {
        return "No posts found in the forum to comment on.";
      }
  
      // Choose a random post from the forumPosts array
      const randomPost =
        forumPosts[Math.floor(Math.random() * forumPosts.length)];
  
      if (randomPost.user === this.persona.name) {
        // If the random post is by the AI persona, choose another random post
        return await this.chooseRandomPostAndRespond(forumChosen);
      }
  
      const response = await axios.get(
        `http://localhost:3000/api/reply/hasAlreadyReplied?postId=${randomPost.id}&userId=${this.persona.name}`
      );
  
      if (response.status === 200) {
        const data = response.data;
        if (data.hasReplied) {
          // User has already replied to this post, skip it
          return await this.chooseRandomPostAndRespond(forumChosen);        
        } else {
          const aiResponse2 = await this.promptAI(
            `Imagine you are a person with the following personality traits: ${JSON.stringify(
              this.persona
            )}. While browsing the '${forumChosen}' forum, you stumble across a post titled "${
              randomPost.title
            }", with the contents being: "${
              randomPost.desc
            }". As this person, what kind of comment would you leave on this post? Just type out the response the character would make, encode with JSON and avoid using \\n outside of the 'reply', we only need two JSON attributes, one called 'reply' and 'postId', with this as the value: ${randomPost.id}`
          );
          return aiResponse2.message.content;
        }
      } else {
        // Handle other status codes as needed
        return "Failed to check if the user has already replied.";
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
  
  async writeOriginalPost(forumChosen){
    const forumPostTitles = (await axios.get(`http://localhost:3000/api/forum/posts/${forumChosen}`)).data.map(post => post.title).join(', ');

    const aiResponse2 = await this.promptAI(
        `Imagine you have a unique personality, a blend of traits like ${JSON.stringify(this.persona)}. Your task is to craft an original and captivating post for the '${forumChosen}' forum. Think of this post as your chance to share your thoughts and insights on any topic that interests you. Be creative, and let your personality shine through in your writing.
      
      To make your post stand out, avoid directly referencing the current discussion topics in the forum, here are the current topics: ${forumPostTitles}. Instead, focus on expressing your own unique perspective or sharing a personal story. Write your response as if you were engaging in a genuine conversation. Don't worry about the length; what matters most is that your post feels complete and leaves a lasting impression.
      
      When you're ready, format your response as a JSON object with two attributes: 'title' and 'desc.' The 'desc' (description) should be a well-rounded and thoughtful text that reflects your personality and provides value to the forum. Remember, it's not about the quantity of words but the quality of your contribution. Instead of using line breaks, feel free to use <br> for formatting.`
      );
      
    return aiResponse2.message.content;
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  getMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }

  // Method to parse the post ID from the AI's response
  parsePostID(response) {
    // Assuming the response contains a specific format to identify the post ID
    const postIdMatch = response.match(/post ID: (\d+)/);
    return postIdMatch ? postIdMatch[1] : null;
  }
}

export default ChatAI;
