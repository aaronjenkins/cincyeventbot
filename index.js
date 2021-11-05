const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

exports.handler = async (event) => {
    let response = await axios.get('https://serpapi.com/search', {
        params: {
            api_key: process.env.SerpAPIKey,
            q: 'Events in Cincinnati, OH',
            google_domain: 'google.com',
            gl: 'us',
            hl: 'en',
            engine: 'google_events'
        },
    });

    let eventsInTheNextThreeDays;
    let tweet = '';
    console.log(response.data.events_results.length);
    if (response.data.events_results.length > 0) {
        let now = new Date();
        let todayFormatted = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        let tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        let tomorrowFormatted = tomorrow.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        let dayAfterTomorrow = new Date(now);
        dayAfterTomorrow.setDate(now.getDate() + 2);
        let dayAfterTomorrowFormatted = dayAfterTomorrow.toLocaleString(
            'en-US',
            {
                month: 'short',
                day: 'numeric',
            }
        );

        let nextThreeDays = [
            todayFormatted,
            tomorrowFormatted,
            dayAfterTomorrowFormatted,
        ];
        eventsInTheNextThreeDays = response.data.events_results.filter(
            function (item) {
                return nextThreeDays.indexOf(item.date.start_date) !== -1;
            }
        );

        eventsInTheNextThreeDays.sort(function (a, b) {
            return new Date(a.date.start_date) - new Date(b.date.start_date);
        });

        tweet += 'Upcoming Events: \r\n';
        for (let i = 0; i < eventsInTheNextThreeDays.length; i++) {
            tweet += `\r\n${eventsInTheNextThreeDays[i].title}\r\n${eventsInTheNextThreeDays[i].date.when}\r\nat ${eventsInTheNextThreeDays[i].address[0]}\r\n`;
        }
    } else {
        tweet = "weird, didn't find any events for the next 3 days...";
    }

    var client = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    await client.v1.tweet(tweet);

    return tweet;
};
