# **MirrorFly React SDK For Video Chat & Calls**

This repository contains samples of how to use MirrorFly to add in-app messaging, voice calling and video calling using React. You can find more information in the [React SDK Documentation](https://www.mirrorfly.com/docs/audio-video/react/quick-start/) on MirrorFly’s official website.

MirrorFly React SDK is a set of prebuilt components that allows you to easily add in-app messaging and calling capabilities with all the essential communication features. Our development kit includes customizable features with support for deployment across any server. Every feature and workflow can be customized, with full access to source code and complete control over the security and infrastructure.

# **🤹 Key Product Offerings** 

MirrorFly helps build omni-channel communication apps for any kind of business

**💬 [In-app chat](https://www.mirrorfly.com/chat/)** \- Connect users individually or as groups via instant messaging features.  
**🎯 [HD Video Calling](https://www.mirrorfly.com/video-call-solution.php)**\- Engage users over face-to-face conversations anytime, and from anywhere.   
**🦾 [HQ Voice Calling](https://www.mirrorfly.com/voice-call-solution.php)** \- Deliver crystal clear audio calling experiences with latency as low as 3ms.   
🤖 [**AI Voice Agent**](https://www.mirrorfly.com/conversational-ai/voice-agent/) \- Build custom  AI voicebots that can understand, act and respond to user questions.   
**🤖 [AI Chatbot](https://www.mirrorfly.com/conversational-ai/chatbot/)** \- Deploy white-label AI chatbots that drive autonomous conversations across any web or mobile app.  
**🦾 [Live Streaming](https://www.mirrorfly.com/live-streaming-sdk.php)** \- Broadcast video content to millions of viewers around the world, within your own enterprise app. 

### **⚒️Chat & Call SDKs For React**

### [**Getting Started**](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#things-to-be-noted-before-you-get-started)

To get the License Key,  
**Step 1:** Register [here](https://www.mirrorfly.com/contact-sales.php) to get a MirrorFly User account.  
**Step 2:** [Login](https://console.mirrorfly.com/) to your Account  
**Step 3:** Get the License key from the application Info’ section  

![license-key][image2]

### [**Integrate Chat SDK into Your React App**](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#integrate-chat-sdk-into-your-react-app)

**Step 1:** Install Mirrorfly SDK in your application

```bash
npm i mirrorfly-sdk
```

**Step 2:** Import the SDK into your application where you want

```js
import * as SDK from "mirrorfly-sdk";
```

#### **Integrate Using SDK Files**

**Step 1:** To download the files from the React SDKs, click on the Download button.  
**Step 2:** Extract the files from the downloaded zip file and copy them into your application.  
**Step 3:** Once the file has been copied, include the script file into your index.html

```html
<script src="./index.js"></script>
```

**Step 4:** Create a new file `SDK.js` in the project root and paste the below code,

```js
const SDK = window.SDK;
export default SDK;
```

**Step 5:** Import the SDK into your application

```js
import SDK from "./SDK";
```

## [**Initialize Chat SDK**](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#initialize-chat-sdk)

To begin the chat SDK initialization, you need certain data to track connection status changes in the client app. Paste your license key into the `licenseKey` parameter and use the method below to pass this data to the SDK for further processing.

```js
const initializeObj = {
  licenseKey: `LICENSE_KEY`,
  callbackListeners: {},
};

await SDK.initializeSDK(initializeObj);
```

### [**Register User**](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#register-user)

**Step 1:** Use the method below to register a new user.  
**Step 2:** After registration, you will receive a username and password, which can be used to connect to the server via the connect method.

```js
await SDK.register(`USER_IDENTIFIER`);
```

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "username": "123456789",
    "password": "987654321",
    "isProfileUpdated": true,
    "isSandbox": true,
    "userJid": "1234567890@xmppdomain"
  }
}
```

### [**Connect to MirrorFly Server**](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#connect-to-mirrorfly-server)

* **Step 1:** Use the credentials obtained during registration to connect to the server.  
* **Step 2:** Upon a successful connection, you will receive an approval message with a statusCode of 200; otherwise, an execution error will occur.  
* **Step 3:** You can monitor the connection status via the `connectionListener` callback function.  
* **Step 4:** If an error occurs while connecting to the server, an error message will be returned through the callback.

```js
await SDK.connect(`USERNAME`, `PASSWORD`);
```

#### [**Sample Response**](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#sample-response-1)**:**

```json
{
  "message": "Login Success",
  "statusCode": 200
}
```

### [**Preparing user jid**](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#preparing-user-jid)

To generate a JID for any user, use the below method.

```js
const userJid = SDK.getJid(USER_NAME);
```

## [Send a Message](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#send-a-message)

Finally, to send a message to another user you can use the below given method,

```js
await SDK.sendTextMessage({
  toJid: "",
  messageText: "",
});
```

#### **Response Format:**

```js
status code: "", // Number - status code
message: "",     // String - Success/Error Message
data: {
  chatType: "",       // String - Chat Type - "chat"
  createdAt: "",      // String - Message Created Time
  deleteStatus: "",   // Number - Delete Status
  favouriteBy: "",    // String - Favourited By - User
  favouriteStatus: "",// Number - Favourite status
  fromUserId: "",     // String - From User Id
  fromUserJid: "",    // String - From User Jid
  metaData: {},       // Object - Meta data for the message
  msgBody: {
    mentionedUsersIds: [], // Array of mentioned users
    message: "",           // String - Message Body
    message_type: "",      // String - Message Type
    nickname: "",          // String - nick name
  },
  msgId: "",           // String - Unique Message Id
  msgType: "",         // String - Message Type
  publisherId: "",     // String - user Id
  timestamp: 1681185232000, // Number - TimeStamp - Milliseconds
  toUserId: "",        // String - toUser Id
  toUserJid: "",       // String - toUser Jid
  topicId: "",         // String - Topic id for the message
}
```

##  [Receive a Message](https://www.mirrorfly.com/docs/chat/react/v2/quick-start#receive-a-message)

To receive messages from another user, implement the `messageListener` function. This function is triggered whenever a new message or related event occurs in one-to-one or group chats. Additionally, during SDK initialization, add the following callback method to handle these events.

```js
function messageListener(response) {
  console.log("Message Listener", response);
}
```

# **Making a call**

### [**Make a voice call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#make-a-voice-call)

Initiate a call by passing the callee’s user JID to the `makeVoiceCall` method. Once the call is successfully initiated, the `callStatusListener` callback will be triggered, providing the callee’s call status.

```js
SDK.makeVoiceCall(['USER_JID'], null, metadata, (success, error) => {
  if (error) {
    // Error occured while making the call
  }
  if (success) {
    // Call has been made successfully
  }
});
```

#### **Success response:**

```json
{
  "statusCode": 200, // Number - status code
  "message": "",     // String - Success/Error Message
  "callType": "",    // String - Call Type - "audio"
  "roomId": ""       // String - Unique room ID
}
```

#### [**Sample Javascript code to play the track**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#sample-javascript-code-to-play-the-track)

```html
<html>
  <audio id="audio" autoplay playsinline></audio>
  <script>
    //let track = TRACK_OBJECT from the callback method
    //let element = ELEMENT_OBJECT in which you need to play the audio
    let stream = new MediaStream([track]);
    try {
      element.srcObject = stream;
    } catch (e) {
      try {
        element.src = URL.createObjectURL(stream);
      } catch (e) {
        console.error("Error attaching stream to element", e);
      }
    }
  </script>
</html>
```

You need to attach the track object received in the callback method to the appropriate audio element, based on the type of track provided.

### [**Make a video call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#make-a-video-call)

Initiate a call by passing the callee’s user JID to the `makeVideoCall` method. Once the call is successfully initiated, the `callStatusListener` callback will be triggered, providing the callee’s call status.

```js
SDK.makeVideoCall(['USER_JID'], null, metadata, (success, error) => {
  if (error) {
    // Error occured while making the call
  }
  if (success) {
    // Call has been made successfully
  }
});
```

#### **Success**

```json
{
  "statusCode": 200, // Number - status code
  "message": "",     // String - Success/Error Message
  "callType": "",    // String - Call Type - "video"
  "roomId": ""       // String - Unique room ID
}
```

#### [**Sample Javascript code to play the track**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#sample-javascript-code-to-play-the-track-1)

```html
<html>
  <audio id="audio" autoplay playsinline></audio>
  <video id="video" autoplay playsinline></video>
  <script>
    //let track = TRACK_OBJECT from the callback method
    //let element = ELEMENT_OBJECT in which you need to play the audio/video
    let stream = new MediaStream([track]);
    try {
      element.srcObject = stream;
    } catch (e) {
      try {
        element.src = URL.createObjectURL(stream);
      } catch (e) {
        console.error("Error attaching stream to element", e);
      }
    }
  </script>
</html>
```

Attach the track object received in the callback method to the appropriate audio element, depending on the type of track provided.

### [**Make a group voice call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#make-a-group-voice-call)

Initiate a group voice call by passing the callee’s user JID and Group ID to the `makeVoiceCall` method. Once the call is successfully initiated, the `callStatusListener` callback will be triggered, providing the call status of each callee.

```js
SDK.makeVoiceCall(
  ['USER1_JID', 'USER2_JID'...],
  'GROUP_ID',
  metadata,
  (success, error) => {
    if (error) {
      // Error occured while making the call
    }
    if (success) {
      // Call has been made successfully
    }
  }
);
```

#### **Success Format**

```json
{
  "statusCode": 200, // Number - status code
  "message": "",     // String - Success/Error Message
  "callType": "",    // String - Call Type - "audio"
  "roomId": ""       // String - Unique room ID
}
```

### [**Make a group video call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#make-a-group-video-call)

Initiate a group video call by passing the callee’s user JID and Group ID to the `makeVideoCall` method. Once the call is successfully initiated, the `callStatusListener` callback will be triggered, providing the call status of each participant.

```js
await SDK.makeVideoCall(
  ['USER1_JID', 'USER2_JID'...],
  'GROUP_ID',
  metadata,
  (success, error) => {
    if (error) {
      // Error occured while making the call
    }
    if (success) {
      // Call has been made successfully
    }
  }
);
```

#### **Success**

```json
{
  "statusCode": 200, // Number - status code
  "message": "",     // String - Success/Error Message
  "callType": "",    // String - Call Type - "video"
  "roomId": ""       // String - Unique room ID
}
```

## [**Receive incoming call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#receive-incoming-call)

To receive an incoming call, the `incomingCallListener` callback must be registered in the callee’s client app. When a user initiates a call, the callee receives the call data through this callback.

```js
// Callback Response Argument Structure
{
  allUsers: ["USER1_JID", "USER2_JID", ...],
  callMode: "onetoone|onetomany",
  callTime: 1681905421215,
  callType: "audio|video",
  from: "USER_JID|FROM_USER_JID",
  groupId: null | GROUP_ID,
  localUser: BOOLEAN,
  roomId: "wmupbheao",
  roomLink: "ndy-bmkb-eui",
  status: "calling",
  to: "FROM_USER_JID|GROUP_JID",
  toUsers: ["USER_JID"],
  userDetails: {},
  userJid: "FROM_USER_JID",
  usersStatus: [{}]
}
```

### [**Answer a call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#answer-a-call)

To answer a call use the `answerCall` method.

```js
SDK.answerCall((success, error) => {
  if (error) {
    // Error occured while answering the call
  }
  if (success) {
    // Call has been answered successfully
  }
});
```

### [**End a call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#end-a-call)

To end a call use the `endCall` method.

```js
SDK.endCall((success, error) => {
  if (error) {
    // Error occured while ending the call
  }
  if (success) {
    // Call has been ended successfully
  }
});
```

### [**Decline a call**](https://www.mirrorfly.com/docs/audio-video/react/making-a-call/#decline-a-call)

To decline a call use the `declineCall` method.

```js
SDK.declineCall((success, error) => {
  if (error) {
    // Error occured while declining the call
  }
  if (success) {
    // Call has been declined successfully
  }
});
```

# **☁️ Deployment Models \- Self-hosted and Cloud**

MirrorFly offers full freedom with the hosting options:  
**Self-hosted:** Deploy your client on your own data centers, private cloud or third-party servers.  
[Check out our multi-tenant cloud hosting](https://www.mirrorfly.com/self-hosted-chat-solution.php)  
**Cloud:** Host your client on MirrorFly’s multi-tenant cloud servers.   
[Check out our multi-tenant cloud hosting](https://www.mirrorfly.com/multi-tenant-chat-for-saas.php)

# **📱 Mobile Client**

MirrorFly offers a fully-built client **SafeTalk** that is available in:  
![Rocket.Chat on Apple App Store][image3] ![Rocket.Chat on Google Play][image4]   
You can use this client as a messaging app, or customize, rebrand & white-label it as your chat client. 

# **📚 Learn More**

* [Developer Documentation](https://www.mirrorfly.com/docs/)  
* [How To Build React Video Chat App](https://www.mirrorfly.com/blog/build-a-video-chat-app-using-react-js/)
* [Dart Documentation](https://pub.dev/packages/mirrorfly_plugin)  
* [Pubdev Documentation](https://pub.dev/packages/mirrorfly_plugin)  
* [Npmjs Documentation](https://www.npmjs.com/~contus)  
* [On-premise Deployment](https://www.mirrorfly.com/on-premises-chat-server.php)   
* [See who's using MirrorFly](https://www.mirrorfly.com/chat-use-cases.php)
* [Chat App Architecture](https://www.mirrorfly.com/blog/chat-app-system-design/)

# **🧑‍💻 Hire Experts**

Need a tech team to build your enterprise app? [Hire a full team of experts](https://www.mirrorfly.com/hire-video-chat-developer.php). From concept to launch, we handle every step of the development process. Get a high-quality, fully-built app ready to launch, carefully built by industry experts

# **⏱️ Round-the-clock Support**

If you’d like to take help when working with our solution, feel free to [contact our experts](https://www.mirrorfly.com/contact-sales.php) who will be available to help you anytime of the day or night. 

## **💼 Become a Part of our amazing team**

We're always on the lookout for talented developers, support specialists, and product managers. Visit our [careers page](https://www.contus.com/careers.php) to explore current opportunities.

## **🗞️ Get the Latest Updates**

* [Blog](https://www.mirrorfly.com/blog/)  
* [Facebook](https://www.facebook.com/MirrorFlyofficial/)  
* [Twitter](https://twitter.com/mirrorflyteam)  
* [LinkedIn](https://www.linkedin.com/showcase/mirrorfly-official/)  
* [Youtube](https://www.youtube.com/@mirrorflyofficial)  
* [Instagram](https://www.instagram.com/mirrorflyofficial/)


