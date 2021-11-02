const axios = require("axios");
const {TwitterApi} = require("twitter-api-v2");

exports.handler = async (event) => {
    const params = {
        api_key: process.env.SerpAPIKey,
        q: "events in Cincinnati, OH",
        google_domain: "google.com",
        gl: "us",
        hl: "en"
      };
      
      let response = await axios.get("https://serpapi.com/search", {params: params})
      let localevents = response.data.events_results
      var now = new Date();
      const todayFormatted = now.toLocaleString('en-US', {  month: 'short', day: 'numeric' });

      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowFormatted = tomorrow.toLocaleString('en-US', {  month: 'short', day: 'numeric' });


      const dayAfterTomorrow = new Date(now)
      dayAfterTomorrow.setDate(now.getDate() + 2)
      const dayAfterTomorrowFormatted = dayAfterTomorrow.toLocaleString('en-US', {  month: 'short', day: 'numeric' });

      let nextThreeDays = [todayFormatted, tomorrowFormatted, dayAfterTomorrowFormatted ];
      let eventsInTheNextThreeDays =  localevents.filter(function(item) {
        return nextThreeDays.indexOf(item.date.start_date) !== -1;
      });
      
      eventsInTheNextThreeDays.sort ( function (a, b){
             return new Date(a.date.start_date) - new Date(b.date.start_date);
      });
      
      let tweet = "";
      for (let i = 0; i < eventsInTheNextThreeDays.length; i++) {
        tweet += `${eventsInTheNextThreeDays[i].title}  ${eventsInTheNextThreeDays[i].date.when} at ${eventsInTheNextThreeDays[i].address[0]}`;
      }

      var client = new TwitterApi({
          appKey: process.env.TWITTER_CONSUMER_KEY,
          appSecret: process.env.TWITTER_CONSUMER_SECRET,
          accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
          accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
      })
      const appOnlyClient = new TwitterApi(process.env.TwitterAPIBearerToken);
      console.log(process.env.TwitterAPIBearerToken)
      await client.v1.tweet(tweet);

      
      return tweet;
};

