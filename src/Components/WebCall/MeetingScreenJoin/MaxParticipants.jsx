import React from "react";
import { NewLogoVector, Callendiconplain } from "../../../assets/images";
import { getMaxUsersInCall } from "../../../Helpers/Call/Call";

const MaxParticipants = () => {
  return (
    <div className="m_participant_wrapper call_end">
      <div className="m_participant_details">
        <div className="brand_logo">
          <img src={NewLogoVector} alt={NewLogoVector} />
        </div>
        <i className="invalidLink">
          <Callendiconplain className="endimg" />
        </i>
        <h2>Maximum {getMaxUsersInCall()} members allowed in call!</h2>
      </div>
    </div>
  );
};

export default MaxParticipants;
