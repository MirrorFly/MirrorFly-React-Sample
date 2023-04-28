import React, { useLayoutEffect, useRef, useState } from "react";
import _get from "lodash/get";
import _toArray from "lodash/toArray";
import WebChatEmoji from "../WebChatEmoji";
import { loaderGIF, Tick } from '../../../assets/images';
import WebChatCamera from '../WebChatVCard/WebChatCamera';
import ContentEditable from '../Conversation/Templates/Common/ContentEditable';
import { ALLOWED_KEY_CODES, CAPTION_CHARACTER_LIMIT } from "../../../Helpers/Constants";
import { removeMoreNumberChar, setCaretPosition } from '../../../Helpers/Chat/ContentEditableEle';
import { useSelector } from "react-redux";
import MentionUserList from "../Conversation/Templates/Common/MentionUserList";
import OutsideClickHandler from "react-outside-click-handler";
import { getUserDetails } from "../../../Helpers/Chat/User";

const CapturePicture = (props = {}) => {
    const { photoTaken, loader, imgSrc, onCameraCheck,
        handleCropImage, setWebcamImage, cropEnabled, chatType} = props
    const targetRef = useRef();
    const [caption, setCaption] = useState({
        value: ""
    });
    const [height, setHeight] = useState({});
    const [selectedText, setSelectedTextState] = useState(null);
    const [position, setPosition] = useState(0);
    const [GroupParticiapantsList, setGrouplist ] = useState({});
    const [showMention,setShowMention] = useState(false)
    const [mentionedUsersIds,setMentionedUsersIds] = useState([])
    const groupMemberList = useSelector((state)=>state.groupsMemberListData);
    const vcard = useSelector((state)=>state.vCardData)
  

    const increaseHeight = () => {
        const cameraHeight = document.getElementById('cameraview')?.clientHeight
        const formAttachcaption = document.getElementById('form-attachcaption')?.clientHeight
        if (!formAttachcaption || !cameraHeight) return
        setHeight({
            height: cameraHeight - formAttachcaption + "px",
        })
    };

    const handleMessage = ({ target }) => {
        const { value = "" } = target || {};
        setCaption((prevState) => ({
            ...prevState,
            value:
                (_get(prevState, "value.length", 0) === 0 && _get(value.trim(), "length", 0) === 0) || (_get(value, "length", 0) === 1 && value === "\n")
                    ? ""
                    : value
        }));
    }

    const handleEmojiText = (emojiObject) => {
        let positionToUpdate = position;
        let text = "";
        // When user select all the text & choose emoji means,
        // Need to replace the emoji with existing content.
        // That's why below we check condition, selectedText & current state caption is equal
        // Need to clear other content message & enter only the emoji
        if (selectedText === caption.value) {
            text = emojiObject;
            positionToUpdate = emojiObject.length;
        } else {
            const start = caption.value.substring(0, position);
            const end = caption.value.substring(position);
            text = start + emojiObject + end;
            positionToUpdate = position + _get(emojiObject, "length", 0);
        }
        if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
            setCaption((prevState) => {
                setCursorPosition(positionToUpdate);
                setCaretPosition(document.getElementById("camera-preview-typingContainer"), positionToUpdate)
                return {
                    ...prevState,
                    value: text
                };
            });
        }
    }
    const handleMentionedData = (userId) => {   
       
        let rosterData = getUserDetails(userId);
        let displayName = rosterData.displayName;
        let positionToUpdate = position;
        let text = "";
          const messageContent = document.getElementById("camera-preview-typingContainer");
          let start = messageContent?.innerHTML?.substring(0, position);
          start = start.substring(0, start.lastIndexOf("@"));
          const end = messageContent?.innerHTML?.substring(position);
          const uihtml = `<span data-mentioned="${userId}" class="mentioned blue">@${displayName}</span> `;
          text = start + uihtml + end;
          positionToUpdate = position + uihtml.length;
          setShowMention(false)
          let mentionedUsersId = mentionedUsersIds;
          mentionedUsersId.push(userId);
          setMentionedUsersIds(
            mentionedUsersId
          )
    
        if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
            setCaption((prevState) => {
            setCursorPosition(positionToUpdate);
            setCaretPosition(document.getElementById("camera-preview-typingContainer"), positionToUpdate);
      
            return {
              ...prevState,
              value: text,
            };
          });
        //   onChangeCaption(media, text,mentionedUsersIds);
        }
      };

      const handleSearchView = (searchValue) => {       
        const GroupParticiapants = groupMemberList.data.participants         
        const vCardUserId = vcard.data.userId 
        const grouplist = GroupParticiapants.filter(participants=>participants.userId !== vCardUserId);
        const searchResult = grouplist.filter((ele) => ele.userProfile.nickName.toLowerCase().includes(searchValue.toLowerCase()))
        setGrouplist(searchResult)
      }
      const handleMentionView = (mentionView, grouplist) =>{
        setGrouplist(grouplist)
        setShowMention(mentionView)
      }
      const handleEmptyContent = () =>{
        setCaption({ value : ""})
     }
      const handleDeleteMentionedUser = (ele) =>{
        
         let mentionedId = ele.dataset.mentioned;
         let mentionedUsersId = [...mentionedUsersIds]
         var index = mentionedUsersId.indexOf(mentionedId);
         if (index > -1) {
         let mention = mentionedUsersId.filter((ind)=> ind !== index)
         setMentionedUsersIds(
          [...mention]
        )  
    }   
     }

    // Added to Restrict User to Enter More than Allowed Characters Length
    const handleOnKeyDownListner = (e) => {
        if (_toArray(_get(caption, "value", "")).length >= CAPTION_CHARACTER_LIMIT && ALLOWED_KEY_CODES.indexOf(e.which) === -1) {
            e.preventDefault();
        }
    };

    const setMessage = () => handleCropImage(caption.value.trim(),mentionedUsersIds)

    const inputListenerHandler = () => true;
    const handleOnFocus = () => true;
    const setSelectedText = (selectedTexts) => setSelectedTextState(selectedTexts);
    const setCursorPosition = (positions) => setPosition(positions);

    const remainingLenthCall = (typingMessageLength = 0) => {
        if (typingMessageLength >= 975) {
            const balanceCount = CAPTION_CHARACTER_LIMIT - typingMessageLength;
            return <span className="captionCount">{balanceCount > 0 ? balanceCount : 0}</span>;
        }
        return "";
    };

    useLayoutEffect(() => {
        window.addEventListener('resize', () => {
            increaseHeight()
        });
        return () => window.removeEventListener('resize', () => {
            increaseHeight()
        });

    }, [photoTaken]);
    return (
        <>
            {photoTaken &&
                <>
                    <div id="cameraview" className="cameraview captured-picture" >
                        <div ref={targetRef} style={height} id='CapturedContainer'>
                            {!cropEnabled &&
                                <img src={imgSrc} alt="camera" />
                            }
                            <div className="popup-controls">

                                {
                                    !loader ?
                                        <i
                                            data-id={"jestsetMessage"}
                                            onClick={setMessage}>
                                            <Tick />
                                        </i> :
                                        <img src={loaderGIF} alt="loader" />
                                }

                            </div>
                        </div>
                    </div>
                    <div id='form-attachcaption' className="form-attachcaption">
                        <div className="form-control ">
                            <i className="emoji">
                                <WebChatEmoji
                                    onEmojiClick={handleEmojiText}
                                />
                            </i>
                            <ContentEditable
                                handleMentionView={handleMentionView}
                                handleSearchView={handleSearchView}
                                handleDeleteMentionedUser={handleDeleteMentionedUser}
                                placeholder={"Add a caption"}
                                handleMessage={handleMessage}
                                handleOnFocus={handleOnFocus}
                                handleSendTextMsg={setMessage}
                                setSelectedText={setSelectedText}
                                chatType={chatType}
                                id="camera-preview-typingContainer"
                                setCursorPosition={setCursorPosition}
                                onInputListener={inputListenerHandler}
                                onKeyDownListner={handleOnKeyDownListner}
                                handleEmptyContent={handleEmptyContent}
                                html={removeMoreNumberChar(CAPTION_CHARACTER_LIMIT, _get(caption, "value", ""))}
                            />
                              {(GroupParticiapantsList.length > 0 && showMention) ?
                               <OutsideClickHandler onOutsideClick={() => handleMentionView(false , {})}>
                               <MentionUserList handleMentionedData={handleMentionedData} GroupParticiapantsList={GroupParticiapantsList} />
                                </OutsideClickHandler>
                                : null
                              }
                            {remainingLenthCall(_toArray(_get(caption, "value", "")).length)}
                        </div>
                    </div>
                </>
            }
            {!photoTaken &&
                <div id="cameraview" className="cameraview captured-picture" >
                    <WebChatCamera
                        sendFile={setWebcamImage}
                        onCameraCheck={onCameraCheck}
                    />
                </div>
            }
        </>
    );
};

export default CapturePicture;
