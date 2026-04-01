# Coaching Site

Node.js + Express + EJS coaching website inspired by the structure of a coaching business site, with Google Calendar booking support and no shop.

## Setup

1. Copy `.env.example` to `.env`
2. Add your Google service account credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`

## Google Calendar setup

- Create a Google Cloud project
- Enable the Google Calendar API
- Create a service account
- Share your target Google Calendar with the service account email
- Put the service account credentials into `.env`

## Notes

- This is a clean recreation of a similar structure, not a copy of any protected branding or text.
- The shop is intentionally omitted.
