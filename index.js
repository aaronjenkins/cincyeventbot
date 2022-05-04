const axios = require('axios');
const { Client, Intents } = require('discord.js');

exports.handler = async (event) => {
    let response = await axios.get('https://serpapi.com/search', {
        params: {
            api_key: process.env.SerpAPIKey,
            q: 'Events in Cincinnati, OH',
            google_domain: 'google.com',
            gl: 'us',
            hl: 'en',
            engine: 'google_events',
        },
    });

    // var client = new TwitterApi({
    //     appKey: process.env.TWITTER_CONSUMER_KEY,
    //     appSecret: process.env.TWITTER_CONSUMER_SECRET,
    //     accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
    //     accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    // });

    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    client.once('ready', () => {
        console.log('Ready!');
    });

    client.login(token);

    console.log(response.data.events_results.length);
    if (response.data.events_results.length > 0) {
        let eventsInTheNextThreeDays;

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

        //split events into groups of 3 cause tweets can be max 280 char
        var i,
            j,
            temporary,
            chunk = 3;
        for (i = 0, j = eventsInTheNextThreeDays.length; i < j; i += chunk) {
            temporary = eventsInTheNextThreeDays.slice(i, i + chunk);
            let tweet = 'Upcoming Events: \r\n';

            for (let p = 0; p < eventsInTheNextThreeDays.length; p++) {
                tweet += `\r\n${eventsInTheNextThreeDays[p].title}\r\n${eventsInTheNextThreeDays[p].date.when}\r\nat ${eventsInTheNextThreeDays[p].address[0]}\r\n`;
            }
            await client.on('messageCreate', () => {
                client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(tweet);
            });
        }
    } else {
        let tweet = "weird, didn't find any events for the next 3 days...";
        await client.on('messageCreate', () => {
            client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(tweet);
        });
    }

    return tweet;
};
