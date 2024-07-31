import os
from datetime import datetime, timedelta
from serpapi import GoogleSearch
from dotenv import load_dotenv
import requests

load_dotenv()  # Load environment variables

def get_upcoming_events():
    api_key = os.environ.get('serp_api_key')
    params = {
        'api_key': api_key,
        'q': 'Events in Cincinnati, OH',
        'google_domain': 'google.com',
        'gl': 'us',
        'hl': 'en',
        'engine': 'google_events'
    }

    search = GoogleSearch(params)
    results = search.get_dict()
    print(f"Response: {results}")
    return results.get('events_results')

def is_event_in_the_next_three_days(event_date):
    today = datetime.now()
    try:
        event_dt = datetime.strptime(event_date, "%b %d")
        event_dt = event_dt.replace(year=today.year)
    except ValueError:
        print(f"Error parsing date: {event_date}")
        return False
    
    tomorrow = today + timedelta(days=1)
    day_after_tomorrow = tomorrow + timedelta(days=1)
    return (
        event_dt.day == today.day or
        event_dt.day == tomorrow.day or
        event_dt.day == day_after_tomorrow.day
    )

def send_message(message):
    webhook_url = os.environ.get('TELEGRAM_URL')
    chat_id = os.environ.get('CHANNEL_ID')
    payload = {
        'chat_id': chat_id,
        'text': message
    }
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(webhook_url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"Response: {response.json()}")
    except requests.RequestException as error:
        print(f"Error: {error}")
        print("Response Status Code:", response.status_code)
        print("Response Body:", response.text)

def parse_event_date(event_date):
    today = datetime.now()
    try:
        event_dt = datetime.strptime(event_date, "%b %d")
        event_dt = event_dt.replace(year=today.year)
        return event_dt
    except ValueError:
        print(f"Error parsing date: {event_date}")
        return None

def main():
    events_results = get_upcoming_events()
    if events_results:
        events_in_the_next_three_days = [
            item for item in events_results if is_event_in_the_next_three_days(item['date']['start_date'])
        ]
        
        events_in_the_next_three_days.sort(
            key=lambda x: parse_event_date(x['date']['start_date']) or datetime.min
        )
        
        message = 'Upcoming Events: \n'
        for event in events_in_the_next_three_days:
            message += f"\n{event['title']}\n{event['date']['when']}\nat {event['address'][0]}\n"
        
        # send_message(message)
        print('Processed events successfully.')
    else:
        message = "weird, didn't find any events for the next 3 days..."
        # send_message(message)
        print('weird, didn\'t find any events for the next 3 days...')

if __name__ == "__main__":
    main()
