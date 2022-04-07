import React from "react";
import GoogleMapMarker from "../Common/GoogleMapMarker";

const LocationComponent = (props = {}) => {
  const { messageObject = {} } = props;
  const {
    msgBody: { location: { latitude = null, longitude = null } = {} } = {}
  } = messageObject;
  return <GoogleMapMarker latitude={latitude} longitude={longitude} />;
};

export default LocationComponent;
