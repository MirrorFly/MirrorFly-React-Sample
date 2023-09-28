import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
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
import { placeCaretAtEnd } from "../../../Helpers/Utility";

const CapturePicture = (props = {}) => {
    const { photoTaken, loader, imgSrc, onCameraCheck,
        handleCropImage, setWebcamImage, cropEnabled, chatType, chatId = "", isRetake = false} = props
    const targetRef = useRef();
    const [caption, setCaption] = useState({
        value: ""
    });
    const [height, setHeight] = useState({});
    const [selectedText, setSelectedTextState] = useState(null);
    let [position, setPosition] = useState(0);
    const [GroupParticiapantsList, setGrouplist ] = useState([]);
    const [showMention,setShowMention] = useState(false);
    const [MentionViewClicked,setMentionViewClicked] = useState(false);
    const [mentionedUsersIds,setMentionedUsersIds] = useState([]);
    const { typedMessage = "" } = useSelector((state)=>state.chatConversationHistory?.data[chatId] || {});
    const [showCursor, setshowCursor] = useState(true);
    const [initalPosition, setInitialPosition] = useState(true);
    const [emojiSelected, setEmojiSelected] = useState(false);
    const [showEmojiState, setShowEmojiState] = useState(false);
    const [searchEmoji, setSearchEmoji] = useState("");
    const [filteredTextForSearch, setFilteredTextForSearch] = useState("");
    const [isRetakeSet, setIsRetake] = useState(true);
    const groupList = useSelector((state)=>state.groupsMemberListData);
    const vcardData = useSelector((state)=>state.vCardData);

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
        if(value.length < 1) setCursorPosition(0);
        setCaption((prevState) => ({
            ...prevState,
            value:
                (_get(prevState, "value.length", 0) === 0 && _get(value.trim(), "length", 0) === 0) || (_get(value, "length", 0) === 1 && value === "\n")
                    ? ""
                    : value
        }));
    }

    const handleEmojiText = (emojiObject, isClicked = false) => {
        setEmojiSelected(isClicked)
        let positionToUpdate;
        let text = "";
        const msgContent = document.getElementById("camera-preview-typingContainer");
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
        let filteredHtml = "";
        if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
            setCaption((prevState) => {
                setCursorPosition(positionToUpdate);
                setCaretPosition(msgContent, positionToUpdate)
                return {
                    ...prevState,
                    value: text
                };
            });
            
            // Handled groupchat emoji search while mentioning group participants
            if ((caption.value.length === position) && chatType === "groupchat") {
                const atIndex = text.lastIndexOf('@')-1;
                const findBeforeAt = text.charAt(atIndex);
                filteredHtml = text.toString().includes('@') && text.substring(text.lastIndexOf('@')+1, positionToUpdate);
                if (filteredHtml !== undefined && filteredHtml.length > 0 &&
                   showMention === true && GroupParticiapantsList.length < 1 && (findBeforeAt === "" || findBeforeAt === " ")) {
                  setFilteredTextForSearch(filteredHtml);
                  setShowMention(true);
                }
            } else if ((caption.value.length !== position) && chatType === "groupchat") {
                const atIndex = text.lastIndexOf('@', position);
                const checkBeforeAt = text.charAt(atIndex-1);
                const result = text.substring(atIndex+1, positionToUpdate);        
                filteredHtml = result;        
                if (filteredHtml !== undefined && filteredHtml.length > 0 &&
                  showMention === true && GroupParticiapantsList.length < 1 && 
                  (checkBeforeAt.includes(' ') === true || checkBeforeAt === "")) {
                    setFilteredTextForSearch(filteredHtml);
                    setShowMention(true);
                }
            }
        }
    }

    const handleshowEmoji = (isClicked = false) => {
        setShowEmojiState(isClicked) 
        if (isClicked === true) {
         const messageContent = document.getElementById("camera-preview-typingContainer");
            if (chatType === "groupchat") {
                let groupMemberList = groupList.data.participants;
                let groupLists = groupMemberList?.filter(participants => participants.userId !== vcardData.data.userId);
                groupLists = groupLists.map((obj) => {
                obj.rosterData = getUserDetails(obj.userId)
                return obj;
                });
                const lastIndex = messageContent.innerHTML.lastIndexOf('@');
                const result = messageContent.innerHTML.substring(lastIndex-1, lastIndex)

                if ((lastIndex < 0 === false) && result.length < 1 || result === ' ') {
                    setShowMention(true)
                    if (searchEmoji !== "" && showMention === true) {
                        handleSearchList(searchEmoji);
                    } else {
                        if (showMention === true) setGrouplist(groupLists);
                    }
                }

                if (position === caption.value.length && (caption.value.includes('&amp;') === true)) {
                placeCaretAtEnd(messageContent)
                } else {
                setCursorPosition(position);
                setCaretPosition(messageContent, position);
                }     
            }
        }
    }

    const handleSearchList = (searchChar = "") => {       
        try {
            let searchValue = searchChar.includes("&amp;") === true ? 
            searchChar.replace("&amp;", "&") : searchChar;
            setSearchEmoji(searchValue);
            if (searchValue.length < 1) {
                setGrouplist([]);
                return;
            }
            let groupParticipants = groupList.data.participants;
            let vcardUserId = vcardData.data.userId;
            let groupMemberlistsForSearch = groupParticipants.filter(participants=>participants.userId !== vcardUserId);
            const searchResults = groupMemberlistsForSearch.filter(
                (ele) => ele.userProfile.nickName.toLowerCase().includes(searchValue.toLowerCase())
            );
            setGrouplist(searchResults);
            return searchResults;
        } catch(e) {}
    }

    const handleMentionedData = (userId, chatName = "", isClicked = false) => {   
        setMentionViewClicked(isClicked);
        let rosterData = getUserDetails(userId);
        let displayName = rosterData.displayName;
        let positionToUpdate;
        let text = "";
        const messageContent = document.getElementById("camera-preview-typingContainer");
        let start = messageContent?.innerHTML?.substring(0, position);
        start = start.substring(0, start.lastIndexOf("@"));
        const end = messageContent?.innerHTML?.substring(position);
        const uihtml = `<span data-mentioned="${userId}" class="mentioned blue" contenteditable="false">@${displayName}</span> `;
        text = start + uihtml + end;
        positionToUpdate = position + (uihtml.length -1);
        setShowMention(false)
        setGrouplist([])
        let mentionedUsersId = mentionedUsersIds;
        mentionedUsersId.push(userId);
        setMentionedUsersIds(mentionedUsersId);
        if (_toArray(text).length <= CAPTION_CHARACTER_LIMIT) {
            setCaption((prevState) => {
                setCursorPosition(positionToUpdate);
                setCaretPosition(messageContent, positionToUpdate);
                return {
                ...prevState,
                value: text,
                };
            });
        }
    };

    const handleMentionView = (mentionView, groupList) =>{
        setGrouplist(groupList)
        setShowMention(mentionView)
    }
    const handleEmptyContent = () =>{
        setCaption({ value : ""})
    }
    const handleDeleteMentionedUser = (ele) =>{
        
        let mentionedId = ele.dataset.mentioned;
        let mentionedUsersId = [...mentionedUsersIds]
        let index = mentionedUsersId.indexOf(mentionedId);
        if (index > -1) {
            let mention = mentionedUsersId.filter((ind)=> ind !== index)
            setMentionedUsersIds([...mention])  
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

    useEffect(() => {
        const msgContent = document.getElementById("camera-preview-typingContainer");
        if (isRetake === true && isRetakeSet === true && msgContent !== null) {
            handleMessage({ target: { value: typedMessage !== "" ? typedMessage : caption.value } });
            setshowCursor(true)
            setIsRetake(true)           
        }
        if (typedMessage !== undefined && typedMessage.length > 0 && photoTaken === true && initalPosition === true) {
            handleMessage({ target: { value: typedMessage } }); // chatscreen typedvalue has been set
            photoTaken === true && setInitialPosition(false)
        }
    }, [photoTaken]);

    useEffect(() => {
        if (chatType === "groupchat" && filteredTextForSearch.length > 0 && filteredTextForSearch !== "") {
            const searchedList = handleSearchList(filteredTextForSearch);
            if (searchedList.length < 1) setShowEmojiState(true);
            else setShowEmojiState(false);
        }
    }, [filteredTextForSearch]);

    useEffect(() => {
        const msgContent = document.getElementById("camera-preview-typingContainer");
        if (chatType === "groupchat") {
            if (GroupParticiapantsList.length > 0 && showMention === true && showEmojiState === true){
              setShowEmojiState(false)
            } else if(GroupParticiapantsList.length < 1 && showMention === true && showEmojiState === false){
              setShowEmojiState(true)
            }
        
            if (MentionViewClicked === true || emojiSelected === true) {
                if (MentionViewClicked === true && (position !== msgContent?.innerHTML.length)) {
                    setCursorPosition(position - 1);
                }

                if ((position !== msgContent?.innerHTML.length) && MentionViewClicked === false && caption.value.includes('span') === false) {
                    setCursorPosition(position)
                    setCaretPosition(msgContent, position)
                } else {
                    if (MentionViewClicked === true && msgContent?.innerHTML.includes("&amp;") === true) {
                        setCursorPosition(msgContent.innerHTML.length)
                        placeCaretAtEnd(msgContent)

                    } else {
                        setCursorPosition(caption.value.length)
                        placeCaretAtEnd(msgContent)
                        console.log("line 396  main ELSE - Else")

                    }
                }            
                emojiSelected && setEmojiSelected(false)
                msgContent?.innerHTML.includes("&amp;") === false && MentionViewClicked && setMentionViewClicked(false)
            } 
        } else {
                if (msgContent?.innerHTML.includes("&amp;") === false) {
                    setCursorPosition(position)
                    setCaretPosition(msgContent, position)
                }
        }
        if (showCursor === true && photoTaken === true && (msgContent !== undefined || msgContent !== null)) {
            if (typedMessage.length < 1) {
                setCursorPosition(caption.value.length);
                placeCaretAtEnd(msgContent);
                if(msgContent?.innerHTML.includes("&amp;")=== false) setshowCursor(false);
                else setshowCursor(false)
                
            } 
            else if (typedMessage.length > 0) {
                if ((position === msgContent?.innerHTML.length) && msgContent?.innerHTML.includes("&amp;")=== true) {
                    setCursorPosition(msgContent?.innerHTML.length)
                    placeCaretAtEnd(msgContent)
                    setshowCursor(false)
                } else {
                    setCursorPosition(caption.value.length);
                    placeCaretAtEnd(msgContent);
                    if(typedMessage.length > 0 && isRetake === false) { setshowCursor(true); } 
                }
            }

        }
      }, [caption, position]);

    useLayoutEffect(() => {
        window.addEventListener('resize', () => {
            increaseHeight()
        });
        return () => window.removeEventListener('resize', () => {
            increaseHeight()
        });

    }, [photoTaken]);

    const handleSearchEmojiView = (searchValue = "") => {
        setSearchEmoji(searchValue);
    }

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
                                emojiState={handleshowEmoji}
                                onEmojiClick={handleEmojiText}
                                showEmoji={showEmojiState}
                                />
                            </i>
                            <ContentEditable
                                handleMentionView={handleMentionView}
                                handleSearchView={handleSearchEmojiView}
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
                            {chatType === "groupchat" && GroupParticiapantsList.length > 0 && showMention && showEmojiState === false && (
                                <OutsideClickHandler onOutsideClick={() => handleMentionView(false , [])}>
                                <MentionUserList 
                                screenName="camera-preview"
                                handleMentionedData={handleMentionedData}
                                GroupParticiapantsList={GroupParticiapantsList} />
                                </OutsideClickHandler>
                            )}  
                            {chatType === "groupchat" && GroupParticiapantsList.length > 0 && showMention && showEmojiState === true && (
                                <MentionUserList 
                                screenName="camera-preview"
                                handleMentionedData={handleMentionedData} 
                                GroupParticiapantsList={GroupParticiapantsList} />
                            )}
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
