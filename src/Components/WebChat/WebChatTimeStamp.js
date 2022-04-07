import { DateTime } from "luxon";

const TIME_FORMAT = "HH:mm";
const FINAL_FORMAT = "d MMM yyyy";

/**
 * formatAMPM() method to perform the am or pm format with time.
 *
 * @param {date} date
 */
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + " " + ampm;
}

/**
 * formatChatDate() method to perform convert into Today, Yesterday and Date format.
 *
 * @param {date} date
 */
export const formatChatDate = (date) => {
  const dateCurrent = DateTime.fromMillis(Date.now());
  const dateMessage = DateTime.fromJSDate(date);
  const datesDiff = dateCurrent.diff(dateMessage, "days").toObject().days;
  if (!datesDiff) {
    return null; /** change ? to null */
  }

  const diffRounded = Math.round(datesDiff);

  if (diffRounded === 0) {
    return "Today";
  } else if (diffRounded === 1) {
    return "Yesterday";
  } else if (diffRounded > 1 && diffRounded <= 6) {
    return DateTime.fromJSDate(date).toFormat("cccc");
  } else {
    return DateTime.fromJSDate(date).toFormat(FINAL_FORMAT);
  }
};

/**
 * formatChatTime() method to perform convert time into now, min ago, mins ago and date format.
 *
 * @param {date} date
 * @param {string} type
 */
export const formatChatTime = (date, type) => {
  if (type === "recent-chat") {
    return formatAMPM(date);
  }
  const dateCurrent = DateTime.fromMillis(Date.now());
  const dateMessage = DateTime.fromJSDate(date);
  const datesDiff = dateCurrent.diff(dateMessage, "minutes").toObject().minutes;

  if (!datesDiff) {
    return null; /** change ? to null */
  }

  const diffRounded = Math.round(datesDiff);

  if (diffRounded === 0) {
    return "Now";
  } else if (diffRounded === 1) {
    return `${diffRounded} min ago`;
  } else if (diffRounded < 60) {
    return `${diffRounded} mins ago`;
  } else {
    return dateMessage.toFormat(TIME_FORMAT);
  }
};

/**
 * formatChatDateTime() method to perform the format date & time.
 *
 * @param {Date} date
 * @param {string} type
 */
export const formatChatDateTime = (date, type) => {
  const timeFormatted = formatChatTime(date, type);
  const dayFormatted = formatChatDate(date);

  if (type === "recent-chat") {
    if (dayFormatted === "Today") {
      return timeFormatted;
    }
    return dayFormatted;
  } else {
    if (timeFormatted.match(/Now|mins? ago/i)) {
      return timeFormatted;
    }
    return dayFormatted;
  }
};

/**
 * convertUTCTOLocalTimeStamp() method to perform convert UTC to local time formate.
 *
 * @param {date} date
 */
export const convertUTCTOLocalTimeStamp = (date) => {
  date = new Date(date.replace(/-/g, "/"));
  var newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
  return newDate;
};

function datetoTime(secs) {
  var todayDate = new Date();
  todayDate.setSeconds(todayDate.getSeconds() - secs);
  return todayDate;
}

function secondsToHms(secs) {
  if (secs === 0){
    return 0;
  }
  secs = Number(secs);
  var calcHours = Math.floor(secs / 3600);
  return calcHours > 0 ? calcHours : 0;
}

function findYesterday(secs , currentDate){
  let currentDateInSec = currentDate.getUTCHours();
  let remaingSec =  secondsToHms(secs) - currentDateInSec;
  return remaingSec  <= 24 ? true : false;
}

export const getLastseen = (secs) => {
  var userDate = datetoTime(secs);
  var currentDate = new Date();
  var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var HHMM = { hour: "numeric", minute: "numeric" };
  if (secs === 0) {
    return "Online";
  } else if (userDate.getDate() === currentDate.getDate() && userDate.getMonth() === currentDate.getMonth()) {
    return `last seen today at ${userDate.toLocaleTimeString("en-US", HHMM)}`;
  } else if ((userDate.getDate() === currentDate.getDate() - 1 && userDate.getMonth() === currentDate.getMonth()) || (userDate.getMonth() === (currentDate.getMonth() -1) && findYesterday(secs ,currentDate))) {
    return `last seen yesterday at ${userDate.toLocaleTimeString("en-US", HHMM)}`;
  } else if (
    (userDate.getDate() === currentDate.getDate() - 1 ||
      userDate.getDate() === currentDate.getDate() - 2 ||
      userDate.getDate() === currentDate.getDate() - 3 ||
      userDate.getDate() === currentDate.getDate() - 4 ||
      userDate.getDate() === currentDate.getDate() - 5 ||
      userDate.getDate() === currentDate.getDate() - 6) &&
    userDate.getMonth() === currentDate.getMonth()
  ) {
    return `last seen on ${weekday[userDate.getDay()]} at ${userDate.toLocaleTimeString("en-US", HHMM)}`;
  } else {
    if (userDate.getDate().toString().length > 1) {
      return `last seen ${userDate.getDate()}-${month[userDate.getMonth()]}-${userDate.getFullYear()}`;
    } else {
      return `last seen ${0}${userDate.getDate()}-${month[userDate.getMonth()]}-${userDate.getFullYear()}`;
    }
  }
};
