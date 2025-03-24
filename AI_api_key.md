1. You will need to use your Google account (Gmail)
2. Go here https://ai.google.dev/gemini-api/docs/models#gemini-2.0-flash
3. Click "create api key".If it ask you for a project head to https://console.cloud.google.com/projectcreate to create a project.
4. Make sure the you are creating an the key for gemini-2.0-flash any other model won't work
5. In your .env.local file add NEXT_PUBLIC_GOOGLE_API_KEY=Your_Api_key_HERE
6. Everything should be work.

- If you want to see if your api key is working do the below in your linux terminal
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=Your_Api_key_HERE" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
  "contents": [{
    "parts":[{"text": "Explain how AI works"}]
    }]
   }'