# React-Native-Tick-Tac-Toe
This is a Tick Tac Toe Multiplayer game built using React Native.

## Setup

1. Install Expo Client and Download Expo App from App Store/Play Store
2. Install React Native Client
3. Sign up for a free PubNub account to get your Pub/Sub API keys. 
4. You need to enable presence to detect the number of people in the game channel, which prevents having more than two people in a game. To do so, go to your PubNub Admin Dashboard, click on the Demo Project App, or create a new app for this project, and click on Keyset. Scroll down to Application add-ons and toggle the Presence switch to on. Keep the default values the same.
5. Clone the repo.
```bash
https://github.com/atul-kumar-singh/React-Native-Tick-Tac-Toe.git
```
6. Go to Go to App.js and replace 'ENTER_YOUR_PUBLISH_KEY_HERE' and 'ENTER_YOUR_SUBSCRIBE_KEY_HERE' with the keys you got after signing up.
7) Run the following command in the terminal to install the dependencies:
```bash
npm install
```

8) To run the app, type the following command in the terminal:
```bash
npm start
```
9. It should start the build in http://localhost:19002/ . If you have simulators and emulators in your machine , use the option to run on simulators, otherwise use step 10.
10. In IOS open camera and scan the code, it will give a pop-up of starting the app in expo client. Open expo client.
11. Javascript build will start and app will open in your phone.
12. For Andriod steps are easy , figure out yourself from this link. https://docs.expo.io/workflow/android-studio-emulator/
