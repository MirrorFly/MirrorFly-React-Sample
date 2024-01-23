import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import { popUpState } from '../../../../../Actions/ConversationAction';
import { CloseReply, ImgFavicon } from "../../../../../assets/images";
import { isTextMessage } from "../../../../../Helpers/Chat/ChatHelper";
import { handleMentionedUser } from "../../../../../Helpers/Chat/User";

// Currently this component not used for Edit

const maximumCaptionLimit = 220;

const EditMessage = React.memo((props) => {
  const { closeReplyAction, jid = "", showMention, editMessage } = props;
  const { msgBody: messageContent = {}, message: groupchatMessage = {}, msgBody: mentionedUsersIds = [] } = editMessage;
  let callRefSpan = React.createRef();
  const { message = "", message_type="", media = {} } = messageContent || groupchatMessage;
  const { caption = "" } = media;

  const [overflowActive , setOverflowActive] = useState(false)
  useEffect(()=>{
      props.popUpState({
          name: 'smileyPopUp',
          smileyPopUp: {
              active: true
          }
      })
      return () =>{
          props.popUpState({
              name: 'smileyPopUp',
              smileyPopUp: {
                  active: false
              }
          })
      }
  },[])

  const getCaptionEdit = (mediaCaption) => mediaCaption?.length > maximumCaptionLimit ? mediaCaption.substring(0, maximumCaptionLimit).concat('...') : mediaCaption;
  
  const isEllipsisActive = (e) => {
      return e.offsetHeight < e.scrollHeight || e.offsetWidth < e.scrollWidth;
    }
  useEffect(() => {
      setOverflowActive(isEllipsisActive(callRefSpan));
  },[callRefSpan]);

  const link = messageContent?.meet?.link;

  return (
      <Fragment>
      {(showMention === false || showMention === undefined) && <div id="edit-block-bottom" className="edit-block-bottom">
          <div className="edit-container">
              <div className={`edit-text-message ${isTextMessage(message_type) ? "text-message" : "" }`}>
                  <span className="edit-title" >{"Edit Message"}</span>
                  {isTextMessage(message_type) && 
                      <span
                       ref={element => callRefSpan = element }
                       className="sender-sends">
                          <span
                           className="edit_mention"
                           dangerouslySetInnerHTML={
                              {__html: handleMentionedUser(getCaptionEdit(message), mentionedUsersIds.mentionedUsersIds, false,"blue")}
                              }
                          ></span>
                      </span>
                  }
                  {overflowActive ? "..." : ""}

                  {message_type === 'image' && 
                        <span
                         className="sender-sends">
                            <span>
                                <span
                                 className="edit_mention"
                                 dangerouslySetInnerHTML={
                                    { __html: handleMentionedUser(getCaptionEdit(caption), mentionedUsersIds.mentionedUsersIds, false,"blue")}
                                    }
                                ></span>
                            </span>
                        </span>
                    }
                    {message_type === 'video' && <span className="sender-sends">
                            <span>
                                <span
                                 className="edit_mention" 
                                 dangerouslySetInnerHTML={
                                    { __html: handleMentionedUser(getCaptionEdit(caption), mentionedUsersIds.mentionedUsersIds, false,"blue")}
                                    }
                                ></span>
                            </span> </span>
                    }
                    {message_type === 'meet' && <span className="sender-sends"> {link}</span>}
              </div>
                {!isTextMessage(message_type) &&
                    <div className="edit-message-type">
                        {message_type === 'meet' &&  <img className="mirrorfly_meeting_logo" src={ImgFavicon} alt="Mirrorfly Video Call" />}
                    </div>
                }
          </div>
          <div className="RemoveEdit">
              <i><CloseReply onClick={() =>closeReplyAction(jid)} /></i>
          </div>
      </div>}

      </Fragment>
  )
})

export default connect(null, {
  popUpState: popUpState
})(EditMessage);