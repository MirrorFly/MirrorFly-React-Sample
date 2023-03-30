import React from "react";
import ImageComponent from "../WebChat/Common/ImageComponent";

const MAX_PROFILE_LIMIT = 3;

const CallerProfileList = (props) => {
  return (
    <div className="calleeProfilesList">
      {props.rosterData?.participantsData &&
        props.rosterData.participantsData.map(
          (el, i) =>
            i < MAX_PROFILE_LIMIT && (
              <div className="calleeProfiles" key={i}>
                <ImageComponent chatType={"chat"} imageToken={el.thumbImage !== "" ? el.thumbImage : el.image} name={el.initialName} />
              </div>
            )
        )}
      {props.rosterData.participantsData.length > MAX_PROFILE_LIMIT && (
        <div className="calleeProfiles">
          <span className="moreText">+{props.rosterData.participantsData.length - MAX_PROFILE_LIMIT}</span>
        </div>
      )}
    </div>
  );
};

export default CallerProfileList;
