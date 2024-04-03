# Mirrorfly-React-Sample-App

Welcome to the Mirrorfly sample app, a chat application built using React and Node.js. 

- **One to One Chat:** Allows users to exchange messages and media privately between two individuals. 
- **Group Chat:** Enables multiple users to participate in a single chat room, exchanging messages and media.
- **One to One Audio/Video Call:** Allows users to have real-time audio or video conversations privately.
- **Group Audio/Video Call:** Enables multiple users to participate in a single audio or video call session.
- **Meetings:** Virtual meetings or video conferencing capabilities where multiple participants can join and collaborate through audio and video communication.

***Note**: Currently allowing a maximum of 8 users only for call activities.*

## Prerequisites

You need to install:
- Node.js 16 LTS [Download Node.js](https://nodejs.org/)
- Npm 8 >= or yarn

## Installation and Setup

### Step 1: Clone the Repository
Clone the repository to your local machine:

```bash
git clone https://github.com/MirrorFly/MirrorFly-React-Sample.git
cd mirrorfly-react-sample
```

### Step 2: Install Dependencies
Install dependencies using npm:

```bash
npm install
```

### Step 3: Add license key
Before integrating CONTUS MirrorFly Chat SDK, you need to obtain an SDK license key for your MirrorFly application. Follow these steps to get your license key:

- Create an account on the [MirrorFly Console page](https://console.mirrorfly.com/register) for free. 
- Provide your basic details.
- Once logged in, navigate to your MirrorFly account 'Overview' page to find your license key.
- Copy the license key from the 'Application Info' section.
- Add your license key to the env file **REACT_APP_LICENSE_KEY** key.


### Step 4: Start the Development Server
Start the development server:

```bash
npm start
```

Open your browser and visit [http://localhost:3000](http://localhost:3000) to view the application.


## Building the Application
To build the application for production, run the following command

```bash
npm run build
```
This command will create a production-ready bundle in the build folder. You can then deploy this bundle to your server.

