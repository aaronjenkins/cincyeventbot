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
        console.log('Successfully fetched events from SERP API.');
        console.log(JSON.stringify(response.data))
    } catch (error) {
        console.error('Error fetching events from SERP API:', error);
        return {
            statusCode: 500,
            body: 'Failed to fetch events!',
        };
    }

    const { events_results } = response.data;

    if (events_results && events_results.length > 0) {
        const eventsInTheNextThreeDays = filterEventsForNextThreeDays(events_results);
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

function filterEventsForNextThreeDays(events) {
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

    return events.filter((item) =>
        isEventInTheNextThreeDays(item.date.start_date)
    );
}

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
        console.log(`Successfully sent message to Telegram: ${JSON.stringify(response.data)}`);
        return {
            statusCode: 200,
            body: 'Message sent to Telegram!',
        };
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        return {
            statusCode: 500,
            body: 'Failed to send message to Telegram!',
        };
    }
}
