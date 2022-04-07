import React from "react";
import ToastServices from "./ToastServices";
import ProfileImage from "../WebChat/Common/ProfileImage";
import { toast } from "react-toastify";

let userJoinedList = [],
  userLeftList = [];

export const getToastElement = (msg, imageToken, initial) => (
  <div className="customToastWrapper">
    <div className="customToast show">
      <div className="outertoast">
        <ProfileImage chatType={"chat"} imageToken={imageToken} name={initial} />
      </div>
      <span>{msg}</span>
    </div>
  </div>
);

export const updateUserList = (type, displayName, toastType) => {
  if (type === "join") {
    if (toastType === "open") {
      userJoinedList.push(displayName);
      userLeftList.splice(displayName);
    } else {
      userJoinedList.splice(displayName);
    }
  }
  if (type === "left") {
    if (toastType === "open") {
      userJoinedList.splice(displayName);
      userLeftList.push(displayName);
    } else {
      userLeftList.splice(displayName);
    }
  }
};

export const getMessage = (userList = []) => {
  if (userList.length === 0) return "";
  else if (userList.length === 1) return userList[0];
  else return `${userList[0]} and ${userList.length - 1} more have `;
};

export const callLinkToast = (type, displayName, imageToken = "", initial = "", toastId = "") => {
  updateUserList(type, displayName, "open");
  let msg = type === "join" ? `${getMessage(userJoinedList)} joined` : `${getMessage(userLeftList)} left`;
  if (toast.isActive(toastId)) {
    toast.update(toastId, { render: getToastElement(msg, imageToken, initial) });
  }

  ToastServices.ParticipantToast(getToastElement(msg, imageToken, initial), toastId, displayName, type);
};
