const axios = require('axios');

exports.handler = async (event) => {
    let response = await axios.get('https://serpapi.com/search', {
        params: {
            api_key: process.env.serp_api_key,
            q: 'Events in Cincinnati, OH',
            google_domain: 'google.com',
            gl: 'us',
            hl: 'en',
            engine: 'google_events',
        },
    });

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

        let message = 'Upcoming Events: \r\n';

        for (let p = 0; p < eventsInTheNextThreeDays.length; p++) {
            message += `\r\n${eventsInTheNextThreeDays[p].title}\r\n${eventsInTheNextThreeDays[p].date.when}\r\nat ${eventsInTheNextThreeDays[p].address[0]}\r\n`;
        }
        await sendMessage(message);
    } else {
        let message = "weird, didn't find any events for the next 3 days...";
        await sendMessage(message);
    }
};

async function sendMessage(message) {
    const webhookUrl = process.env.TELEGRAM_URL;

    const payload = {
        chat_id: process.env.CHANNEL_ID,
        text: message,
    };

    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await axios.post(webhookUrl, payload, config);
        console.log(`Response: ${response.data}`);
        return {
            statusCode: 200,
            body: 'Message sent to Telegram!',
        };
    } catch (error) {
        console.error(`Error: ${error}`);
        return {
            statusCode: 500,
            body: 'Failed to send message to Telegram!',
        };
    }
}
