import React, { Fragment } from "react";
import { MAP_URL } from "../../../../../Helpers/Chat/Constant";
import { REACT_APP_GOOGLE_LOCATION_API_KEY } from "../../../../processENV"

const GoogleMapMarker = (props = {}) => {
    const { latitude = 0, longitude = 0 } = props;
    const apiKey = REACT_APP_GOOGLE_LOCATION_API_KEY;
    const file_url = `${MAP_URL}?center=${latitude},${longitude}&zoom=13&size=200x200&markers=color:red|${latitude},${longitude}&key=${apiKey}`;
    return (
        <Fragment>
            <div
                className="message-location"
            >
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.google.com/maps/?q=${latitude},${longitude}`}
                >
                    <img
                        src={file_url}
                        alt="location-map"
                    />
                </a>
            </div>
        </Fragment>
    );
};

export default GoogleMapMarker;
