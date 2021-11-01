const axios = require("axios");


exports.handler = async (event) => {
    const params = {
        api_key: process.env.SerpAPIKey,
        q: "events in Cincinnati, OH",
        google_domain: "google.com",
        gl: "us",
        hl: "en"
      };
      
      return await axios.get("https://serpapi.com/search", {params: params})
      
};

