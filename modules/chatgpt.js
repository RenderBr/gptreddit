import OpenAI from "openai";
import axios from "axios";
import config from "../config";

class ChatAI {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.gpt_api_key,
    });
    this.messages = []; // Array to store messages
    this.persona = null;
    this.chosenForum = null;
  }

  // Communicate with OpenAI and get a response
  async promptAI(prompt) {
    try {
      this.saveMessage({ role: "system", content: prompt });

      const response = await this.openai.chat.completions.create({
        messages: this.messages,
        model: "gpt-3.5-turbo-16k-0613",
      });

      const aiMessage = {
        role: "assistant",
        content: response.choices[0].message.content,
      };
      this.saveMessage(aiMessage);

      return response.choices[0];
    } catch (error) {
      console.error("Error in promptAI:", error);
      throw error;
    }
  }

  // Fetch persona details based on the character name
  async getPersona(character) {
    if (!this.persona) {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/user/${character}`
        );
        this.persona = response.data;
      } catch (error) {
        console.error("Error fetching persona:", error);
        throw error;
      }
    }
    return this.persona;
  }

  async readOrPost(forum) {
    const randomNumber = Math.random();

    let aiResponse;

    if (randomNumber < 0.5) {
      aiResponse = await this.promptAI(
        `Based on the personality traits: ${JSON.stringify(
          this.persona
        )}, and considering your exploration of the '${
          forum.name
        }' forum, which focuses on '${
          forum.desc
        }', how would you like to engage? Would it align more with your personality to create a new post, read through existing discussions, or directly respond to an existing post or reply? Please indicate your preference by responding with 'post', 'read', or 'reply' only.`
      );
    } else {
      aiResponse = await this.promptAI(
        `Based on the personality traits: ${JSON.stringify(
          this.persona
        )}, and as you explore the '${forum.name}' forum which focuses on '${
          forum.desc
        }', consider stepping out of your comfort zone. 

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
    this.chosenForum = aiResponse.message.content;
    return aiResponse.message.content;
  }

  async fetchForumPosts(forumChosen) {
    const forumPostsResponse = await axios.get(
      `http://localhost:3000/api/forum/posts/${forumChosen}`
    );
    const forumPosts = forumPostsResponse.data;
    return forumPosts;
  }

  async chooseRandomReplyAndRespond(forumChosen) {
    try {
      this.clearMessages();
      const forumPosts = await this.fetchForumPosts(forumChosen);
      if (!forumPosts || forumPosts.length === 0)
        return "No posts found in the forum to comment on.";

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
        replies = replies.filter((reply) => reply.user !== this.persona.name);

        if (replies.length > 0) {
          const randomReply =
            replies[Math.floor(Math.random() * replies.length)];

          return await this.generateNestedReply(
            forumChosen,
            randomPost,
            randomReply
          );
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

  async generateReply(forumChosen, randomPost) {
    const jsonInstructions = `Encode your reply in JSON format, with no line breaks within the 'reply' field. Use '<br>' for necessary line breaks. 
    The JSON should contain two attributes: 'reply', which is your comment, and 'postId', which should be set to: ${randomPost.id}. 
    Remember, the essence is to make your reply authentic to your character, while keeping it concise and adhering to the JSON format guidelines.`;

    const aiResponse2 = await this.promptAI(`
  Imagine you are a ${this.persona.age}-year-old ${this.persona.gender} named ${this.persona.name}. 
  Your personality is defined by these traits: (${this.persona.personality}). 
  Your name, age, gender and each trait should distinctly influence how you express yourself in this comment. 
  If you're 'empathetic', show understanding; if 'sarcastic', use dry humor; if 'inquisitive', ask insightful questions. 
  Assume guidelines based on your personality traits, but also emulate a typical Reddit user's writing style.
  You are browsing the '${forumChosen}' forum and come across a post titled "${randomPost.title}", 
  with the content: "${randomPost.desc}". 
  You have decided to write a comment on this post. You do not need to introduce yourself.
  Your comment should reflect your personality, but also emulate a typical Reddit user's writing style. Since it's just a comment, keep it brief, unless your personality traits indicate otherwise.
  Remember, the key is to let your personality traits shine through in your writing style and the content of your comment. Just be authentically you.
  ${jsonInstructions}`);

    return aiResponse2.message.content;
  }

  async generateNestedReply(forumChosen, randomPost, randomReply) {
    if (randomPost.user == this.persona.name) {
      const jsonInstructions = `Encode your reply in JSON format, with no line breaks within the 'reply' field. Use '<br>' for necessary line breaks. 
      The JSON should contain three attributes: 'reply', which is your resposne, 'postId', which should be set to: ${randomPost.id}, and 'replyingTo' which should be set to: ${randomReply.replyId}. 
      Remember, the essence is to make your reply authentic to your character, while keeping it concise and adhering to the JSON format guidelines.`;

      const aiResponse2 = await this.promptAI(`
      Imagine you are a ${this.persona.age}-year-old ${this.persona.gender} named ${this.persona.name}. 
      Your personality is defined by these traits: (${this.persona.personality}). 
      Your name, age, gender and each trait should distinctly influence how you express yourself in this response. 
      If you're 'empathetic', show understanding; if 'sarcastic', use dry humor; if 'inquisitive', ask insightful questions. 
      Assume guidelines based on your personality traits, but also emulate a typical Reddit user's writing style.
      Previously, on the '${forumChosen}' forum you made a post titled "${randomPost.title}", 
      with the content: "${randomPost.desc}". 
      Somebody named ${randomReply.user} left a reply on your post: ${randomReply.msg}.
      You have decided to write a response to this user. You do not need to introduce yourself.
      Your response should reflect your personality, but also emulate a typical Reddit user's writing style. Since it's just a comment, keep it brief, unless your personality traits indicate otherwise.
      Remember, the key is to let your personality traits shine through in your writing style and the content of your comment. Just be authentically you.
       ${jsonInstructions}`);
      return aiResponse2;
    } else {
      const jsonInstructions = `Encode your reply in JSON format, with no line breaks within the 'reply' field. Use '<br>' for necessary line breaks. 
      The JSON should contain three attributes: 'reply', which is your resposne, 'postId', which should be set to: ${randomPost.id}, and 'replyingTo' which should be set to: ${randomReply.replyId}. 
      Remember, the essence is to make your reply authentic to your character, while keeping it concise and adhering to the JSON format guidelines.`;

      const aiResponse2 = await this.promptAI(`
      Imagine you are a ${this.persona.age}-year-old ${this.persona.gender} named ${this.persona.name}. 
      Your personality is defined by these traits: (${this.persona.personality}). 
      Your name, age, gender and each trait should distinctly influence how you express yourself in this response. 
      If you're 'empathetic', show understanding; if 'sarcastic', use dry humor; if 'inquisitive', ask insightful questions. 
      Assume guidelines based on your personality traits, but also emulate a typical Reddit user's writing style.
      You are browsing a forum post in '${forumChosen}'. The post is titled "${randomPost.title}", 
      with the content: "${randomPost.desc}, it was written by ${randomPost.user}". 
      While reading the comments, you see a comment by ${randomReply.user} that says: "${randomReply.msg}".
      You have decided to write a response to this user, keep in mind their reply is likely in response to the original poster ${randomPost.user}, and you are ${this.persona.name}. You do not need to introduce yourself.
      Your response should reflect your personality, but also emulate a typical Reddit user's writing style. Since it's just a comment, keep it brief, unless your personality traits indicate otherwise.
      Remember, the key is to let your personality traits shine through in your writing style and the content of your comment. Just be authentically you.
       ${jsonInstructions}`);
      return aiResponse2;
    }
  }

  async fetchRepliesForPost(postId) {
    const response = await axios.get(
      `http://localhost:3000/api/post/replies/${postId}`
    );
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
          this.clearMessages();

          return generateReply(forumChosen, randomPost);
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

  async writeOriginalPost(forumChosen) {
    this.clearMessages();
    const forumPostTitles = (
      await axios.get(`http://localhost:3000/api/forum/posts/${forumChosen}`)
    ).data
      .map((post) => post.title)
      .join(", ");
      
    console.log(`
    this.persona.age: ${this.persona.age}, \n
    this.persona.gender: ${this.persona.gender}, \n
    this.persona.name: ${this.persona.name}, \n
    this.persona.personality: ${this.persona.personality}, \n
    forumChosen: ${forumChosen}, \n
    forumPostTitles: ${forumPostTitles}
    `);

    const jsonInstructions = `Enocde your post in JSON with 'title' and 'desc'. Keep it neat – no line breaks, use <br> instead.`;
    const aiResponse2 = await this.promptAI(`
    Imagine you are a ${this.persona.age}-year-old ${this.persona.gender} named ${this.persona.name}. 
    Your personality is defined by these traits: (${this.persona.personality}). 
    Your name, age, gender and each trait should distinctly influence how you express yourself in the post. 
    For instance, if you are 'creative', include original ideas; if 'witty', add humor; if 'analytical', provide in-depth analysis. 
    Assume guidelines based on your personality traits, but also emulate a typical Reddit user's writing style.
    You are about to make a post in '${forumChosen}'. 
    Please avoid these overused topics: (${forumPostTitles}), to ensure your post is unique. 
    Your post should reflect your personality, but also emulate a typical Reddit user's writing style. Whether its on the longer side or the shorter side should be determined by your personality. Ideally, we want to keep the posts under 150 words, but the average post should be 20-60. 
    Remember, the key is to let your personality traits shine through in your writing style and the content of your post. Just be authentically you. ${jsonInstructions}`);

    return aiResponse2.message.content;
  }

  // Add a new message to the messages array
  saveMessage(message) {
    this.messages.push(message);
  }

  // Get all messages
  getMessages() {
    return this.messages;
  }

  // Clear all messages
  clearMessages() {
    this.messages = [];
  }
}

export default ChatAI;
