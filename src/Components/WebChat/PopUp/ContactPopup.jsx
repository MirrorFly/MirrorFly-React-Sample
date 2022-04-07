import React from 'react';
import {Close2, ChatContactImg } from '../../../assets/images';
export const ContactPopup = (props) => {
    const {toggleContactPopup, phoneNumber,name} = props
    return (
        <div className="popup-wrapper">
        <div className="popup-container contactPopup">
            <div className="popup-container-inner">
                <div className="popup-container-header">
                    <i onClick={toggleContactPopup} className="closePopup"><Close2/></i>
                    <h5>View contact</h5>
                </div>
                <div className="popup-body popup-body-sm">
                    <div className="contact-message-block">
                        <div className="contact-message-inner">
                            <div className="contact"><img src={ChatContactImg}/></div>
                            <div className="contact-text">
                                <p className="name">{name}</p>
                                <p className="no">{phoneNumber}</p>
                            </div>

                            {/* Need to implement  */}
                            {/* <span className="messageContact">
                                <i><ChatBubble/></i>
                            </span> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}
