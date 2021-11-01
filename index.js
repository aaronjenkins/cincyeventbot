require('dotenv').config();
const SerpApi = require('google-search-results-nodejs')
const search = new SerpApi.GoogleSearch(process.env.SerpAPIKey)


exports.handler = async (event) => {
    const params = {
        q: "events in Cincinnati, OH",
        google_domain: "google.com",
        gl: "us",
        hl: "en"
      };
      
      const callback = function(data) {
        console.log(data['events_results']);
      };
      
    return search.json(params, callback);
};

