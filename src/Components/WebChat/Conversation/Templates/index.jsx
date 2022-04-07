import React from "react";
import Message from "./Chat/ChatMessageTemplate.jsx";

const groupChat = {
  message: Message,
};

const singleChat = {
  message: Message,
};

const templateObject = {
  chat: singleChat,
  broadcast: singleChat,
  groupchat: groupChat
};

const createComponent = (chatType) => {
  return templateObject[chatType];
};

const CreateTemplate = (props = {}) => {
  const { chatType } = props;
  const { message: Component = {} } = createComponent(chatType) || {};
  if (!Component) return null;
  return <Component {...props} />;
};

export default CreateTemplate;
