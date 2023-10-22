const axios = require('axios');

exports.handler = async (event) => {
    let response;
    try {
        response = await axios.get('https://serpapi.com/search', {
            params: {
                api_key: process.env.serp_api_key,
                q: 'Events in Cincinnati, OH',
                google_domain: 'google.com',
                gl: 'us',
                hl: 'en',
                engine: 'google_events',
            },
        });
    } catch (error) {
        console.error(`Failed to fetch events: ${error}`);
        return {
            statusCode: 500,
            body: 'Failed to fetch events!',
        };
    }

    const { events_results } = response.data;

    if (events_results && events_results.length > 0) {
        const now = new Date();
        const today = now;
        const tomorrow = new Date(now.setDate(now.getDate() + 1));
        const dayAfterTomorrow = new Date(now.setDate(now.getDate() + 1));

        const isEventInTheNextThreeDays = (eventDate) => {
            const eventDt = new Date(eventDate);
            return (
                eventDt.getDate() === today.getDate() ||
                eventDt.getDate() === tomorrow.getDate() ||
                eventDt.getDate() === dayAfterTomorrow.getDate()
            );
        };

        const eventsInTheNextThreeDays = events_results.filter((item) =>
            isEventInTheNextThreeDays(item.date.start_date)
        );

        eventsInTheNextThreeDays.sort(
            (a, b) => new Date(a.date.start_date) - new Date(b.date.start_date)
        );

        let message = 'Upcoming Events: \r\n';

        for (let event of eventsInTheNextThreeDays) {
            message += `\r\n${event.title}\r\n${event.date.when}\r\nat ${event.address[0]}\r\n`;
        }

        await sendMessage(message);
        console.log('Processed events successfully.');
        return {
            statusCode: 200,
            body: 'Processed events successfully!',
        };
    } else {
        let message = "weird, didn't find any events for the next 3 days...";
        await sendMessage(message);
        console.warn('No events found for the next 3 days.');
        return {
            statusCode: 200,
            body: 'No events found for the next 3 days.',
        };
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
