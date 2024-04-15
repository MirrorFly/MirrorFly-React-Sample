import React from "react";
import { NewLogoVector, IconInvalidLink, Callendiconplain } from "../../../assets/images";

const CallLinkStatus = (props = {}) => {
  const { handleBack, callEndScreen = false, serverError = false, invalidLink = false } = props;
  return (
    <div className="m_participant_wrapper call_end">
      <div className="m_participant_details">
        <div className="brand_logo">
          <img src={NewLogoVector} alt={NewLogoVector} />
        </div>
        { callEndScreen &&
          <>
            <i className="invalidLink">
              <Callendiconplain className="endimg" />
            </i>
            <h2>Call Ended!</h2>
            <p>No one else is here</p>
          </>
        }
        { invalidLink &&
          <>
            <i className="invalidLink">
              <IconInvalidLink className="endimg" />
            </i>
            <h2>Invalid link</h2>
            <button onClick={handleBack} className="ReturnBack">
              Return to chat
            </button>
          </>
        }
        { serverError &&
          <>
            <i className="invalidLink">
              <IconInvalidLink className="endimg" />
            </i>
            <h2>Couldn't process the link.</h2>
            <h2>Please try again.</h2> 
            <button onClick={handleBack} className="ReturnBack">
              Return to chat
            </button>
          </>
        }
      </div>
    </div>
  );
};

export default CallLinkStatus;
