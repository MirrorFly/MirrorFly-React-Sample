import React from "react";
import { ContactDetails, ChatContactSample } from "../../../../../assets/images";

const ContactComponent = (props = {}) => {
  const { messageObject = {}, toggleContactPopup } = props;
  const { msgBody: { contact: { name = "" } = {} } = {} } = messageObject;

  return (
    <div className="contact-message-block">
      <div className="contact-message-inner">
        <div className="contact">
          <img src={ChatContactSample} alt="" />
        </div>
        <div className="contact-text">
          <p className="name">{name}</p>
        </div>
        <span onClick={toggleContactPopup} className="Contactdetails">
          <i>
            <ContactDetails />
          </i>
        </span>
      </div>
    </div>
  );
};

export default ContactComponent;
