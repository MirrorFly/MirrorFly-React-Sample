import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import React, { Component } from 'react';
import { placeCaretAtEnd } from '../../../../../Helpers/Utility';
import { getCaretPosition, getSelectedText } from '../../../../../Helpers/Chat/ContentEditableEle';
import { getUserDetails } from '../../../../../Helpers/Chat/User';
import { CHAT_TYPE_GROUP } from '../../../../../Helpers/Chat/Constant';

class ContentEditable extends Component {
    constructor(props = {}) {
        super(props)
        this.state = {
            lastHtml: ''
        }
        this.searchView = true
        this.searchValue = ''
        this.searchPos = 0
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.html !== this.typingContainner.innerHTML;
    }

    componentDidUpdate() {
        if (this.props.html !== this.typingContainner.innerHTML) {
            this.typingContainner.innerHTML = this.props.html;
        }
    }

    pasteAsPlainText = (event = {}) => {
        event.preventDefault();
        const msgContent = document.getElementById("typingContainer");
        if (document && document.activeElement instanceof HTMLElement) {
            const remainingText = event?.clipboardData?.getData('text/plain').substring(0)
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(remainingText));
            placeCaretAtEnd(msgContent);
            this.emitChange();
          }
        };            

    emitChange = (event, isBack = false, isShow = false, isClickedTypingField = false) => {
        let html = this.typingContainner.innerHTML;
        let newStr = html.replace(/<br>/g, "");
        let selection = window.getSelection();
    
        if (!html && html.replace(/^\s+/, "") === html || this.typingContainner.innerHTML === "<br>" || 
         (selection.toString().length === this.typingContainner.innerHTML.length)) {
            this.props.handleMessage({
                target: {
                    value: ""
                }
            });
            this.props.handleEmptyContent();
            this.setState({ lastHtml: "" });
            return
        }
        if (this.props.handleMessage) {
            this.props.onInputListener()
            this.currentPosition();
            this.props.handleMessage({
                target: {
                    value: html
                }
            },isClickedTypingField);
        }

        this.lastHtml = newStr;
        const lastElement = newStr.slice(-1);
        const secondLastElement = newStr.slice(-2, -1);
        const thirdLastElement = newStr.slice(-3, -2);
        const position =  getCaretPosition(this.typingContainner);
        let midPosLast = position - 1;
        let midPosSecondLast = newStr.charAt(position-2);
        let midLastEle = newStr.charAt(position);
        let midSecondLastEle = newStr.charAt(midPosLast);
        if (this.props.chatType === CHAT_TYPE_GROUP) {
            if (newStr.length > 1) {  
                this.handleMentionEnableDisable(isBack, lastElement, secondLastElement, thirdLastElement,
                    midLastEle, midSecondLastEle, midPosSecondLast);

                //Handles the search in mention Popup
                const pattern = /\B@\.*/g;
                if (newStr.match(pattern)) {
                    this.handleMentionTextSearch(position, newStr, isBack, midLastEle, midSecondLastEle, isShow);
                }
            }
        }
    }

    handleMentionTextSearch = (position, newStr, isBack, midLastEle, midSecondLastEle, isShow) => {
        let filteredHtml;
        let midPosLastEleFromInitCursor = position - 1;
        let midSecondLastEleFromInitCursor = newStr.charAt(position-1);
        let midthirdLastEleFromInitCursor = newStr.charAt(position-2);
        let getText = newStr.substring(0, position);
        let findAtIndex = getText.lastIndexOf('@');
        let findCharBeforeAtSymbol = newStr.charAt(findAtIndex - 1);

        if (position === newStr.length || isShow) {
            filteredHtml = newStr.includes('@') && newStr.substr(newStr.lastIndexOf('@') + 1);
            if (this.typingContainner.innerHTML.includes("&amp;") === true &&
                this.typingContainner.innerHTML.toString().endsWith("@&amp;") === true && isBack === true) {
                    this.props.handleMentionView(true, this.groupMentionUsersList())
            } else {
                if((findCharBeforeAtSymbol === "" || findCharBeforeAtSymbol === " ") &&
                this.searchView === true && this.lastHtml.length > 0) {
                    this.groupMentionUsersList(filteredHtml, true)
                } 
            }
        } else {
            if (midSecondLastEleFromInitCursor.includes('@') && 
            (midthirdLastEleFromInitCursor.includes(' ') || midthirdLastEleFromInitCursor.includes('')))  {
                this.searchValue = midSecondLastEleFromInitCursor;
                this.searchPos = midPosLastEleFromInitCursor;
            }
            let searchData;
            if (this.searchPos !== position) {
                searchData = newStr.substring(this.searchPos, position);
            } else searchData = newStr.substring(this.searchPos-1,position);

            let newSearchData = searchData.replace('@',"")
            filteredHtml = newSearchData;
            if ((midLastEle === '@' && midSecondLastEle === '@') || (midLastEle === '@' && midSecondLastEle === ' ') || 
            ((midthirdLastEleFromInitCursor === '@')
            && midSecondLastEle === '@') || (this.searchValue === '@' && midLastEle === '@')) {
                this.searchView = false;
                this.groupMentionUsersList(filteredHtml, false)
            } else {
                if(this.searchView === true) {
                    this.groupMentionUsersList(filteredHtml, true)
                }
            }
        }     
    }

    handleMentionEnableDisable = (isBack, lastElement, secondLastElement, thirdLastElement,
         midLastEle, midSecondLastEle, midPosSecondLast) => {
        let newStr = this.typingContainner.innerHTML.replace(/<br>/g, "");
        const position =  getCaretPosition(this.typingContainner);
        let regex = /^ +$/;

        if (position === newStr.length) { 
            if (( lastElement === '@' && secondLastElement === ' ' && thirdLastElement === '@') || 
            (lastElement === '@' && secondLastElement.length > 0 && regex.test(secondLastElement) === true && isBack === false )) {
                    this.props.handleMentionView(true, this.groupMentionUsersList())
                    this.searchView = true
            }
           else if((lastElement === '@' && secondLastElement === '@') || (lastElement === '@' && secondLastElement !== ' ')
            || (lastElement === ' ' && secondLastElement === '@' && thirdLastElement === '@')) {
                    this.props.handleMentionView(false, [])
                    this.searchView = false
                    return                         
            }
        } 
                
        if (position !== newStr.length) {
            if (midSecondLastEle.length > 0 && midSecondLastEle === '@' &&
                (regex.test(midPosSecondLast) === true || midPosSecondLast === "") &&
                 (midLastEle === ' ' || midLastEle === '' || midLastEle !== " ") && midLastEle !== '@') {
                this.props.handleMentionView(true, this.groupMentionUsersList())
                this.searchView = true;
            } else {
                this.props.handleMentionView(false, [])
            }
        } 
    }

    groupMentionUsersList = (filteredHtml = "", searchEnable = false) => {
        const groupMemberList = this.props.groupsMemberListData?.data?.participants;
        let grouplist = groupMemberList.filter(participants => participants.userId !== this.props.vCardData.data.userId);
        grouplist = grouplist.map((obj) => {
            obj.rosterData = getUserDetails(obj.userId)
            return obj;
        });
        if(searchEnable === true){
            if(filteredHtml.length < 1){
                return;
            } 
            let replaceText = filteredHtml.includes("&amp;") === true ? filteredHtml.replace("&amp;", "&") : filteredHtml;
            filteredHtml = replaceText;
            const searchResult = grouplist.filter((ele) => ele.userProfile.nickName.toLowerCase().includes(filteredHtml.toLowerCase()))
            if(searchResult.length > 0){
                this.props.handleMentionView(true, searchResult)
            }else{
                this.props.handleMentionView(false, [])
            } 
        }
        this.props.handleSearchView && this.props.handleSearchView(filteredHtml);
        return grouplist;
    }


    onKeyDownListner = (e = {}) => {
        this.props.onKeyDownListner && this.props.onKeyDownListner(e)
        const newStr = this.typingContainner.innerHTML.replace(/<br>/g, "");        
        const lastElement = newStr.slice(-1);
        const secondLastElement = newStr.slice(-2, -1);
        const thirdLastElement = newStr.slice(-3, -2);
        const position = getCaretPosition(this.typingContainner);

        if (e.which === 37) {
           this.handleLeftArrowKey(secondLastElement, thirdLastElement);
        }
        if (e.which === 13 && e.shiftKey === false) {
            this.handleEnterKey(e);
        }
        if (e.which === 50 && e.shiftKey === true) { 
            this.handle_AtSymbolKey(newStr, lastElement, secondLastElement, thirdLastElement);
        }
        if (e.which === 32) {
            this.handleSpaceBarKey(secondLastElement, thirdLastElement);
        }
        if (e.which ===  8 || e.which === 46) {
            if (this.props.chatType === CHAT_TYPE_GROUP) {
                this.handleBackspaceAndDeleteKey(position, newStr, lastElement, secondLastElement, thirdLastElement);

                let s = window.getSelection();
                let r = s.getRangeAt(0);
                let el = r.startContainer.parentElement;
                // Check if the current element is the .label
                if (el.classList.contains('mentioned')) {
                    // Check if we are exactly at the end of the .label element
                    if ((r.startOffset === r.endOffset && r.endOffset === el.textContent.length) || s.toString()) {
                        // prevent the default delete behavior
                        e.preventDefault();
                        el.remove();  
                        this.emitChange();
                        this.props.handleDeleteMentionedUser(el);

                        // Handling the content selection with mentioned when backspace triggers
                        if(s.toString() && (position === this.typingContainner.innerHTML.length)){
                            this.setState({isSelected: false})
                            this.props.handleEmptyContent()
                            this.setState({lastHtml: ""})
                            return
                        }
                        return;
                    }
                }
            }  
            if (position === this.typingContainner.innerHTML.length) {
                if (this.typingContainner.innerHTML.length <= 1) {
                    this.props.handleMessage({
                        target: {
                            value: ""
                        }
                    });
                    return
                }
            }      
        }

        if (e.ctrlKey || e.metaKey) {
          this.handleCtrlOrMetaKey(e);
        }

        return true;
    }
      
    handleLeftArrowKey = (secondLastElement, thirdLastElement) => {
        if (this.props.chatType === CHAT_TYPE_GROUP) {
            if (secondLastElement !== "@" && thirdLastElement.length < 1 ||
                (secondLastElement !== "@" && thirdLastElement !== " ")|| secondLastElement === ' ' || thirdLastElement === ' ') {
                this.props.handleMentionView(false, []);
            }     
        }
    }
      
    handleEnterKey = (e) => {
        e.preventDefault()
        if (this.typingContainner.innerHTML.replace(/^\s+/, "") === "" ||
            this.typingContainner.innerHTML.includes("<div><br></div>")) {
            return false;
        }
        this.props.handleSendTextMsg();
        this.props.handleEmptyContent();
        this.props.handleMentionView && this.props.handleMentionView(false, []);
        this.setState({ lastHtml: "" })
    }
      
    handle_AtSymbolKey = (newStr, lastElement, secondLastElement, thirdLastElement) => {
        if (this.props.chatType === CHAT_TYPE_GROUP) {
            const groupList = this.groupMentionUsersList();
            const position = getCaretPosition(this.typingContainner);
            if (position === newStr.length) {
                if (lastElement === '' || secondLastElement === '@' ||
                    (secondLastElement === '@' && thirdLastElement === '@') ||
                    (lastElement === ' ' && secondLastElement === ' ') ||
                    (lastElement === ' ' && secondLastElement !== ' ')) {
                    this.props.handleMentionView(true, groupList);
                    this.searchView = true
                    this.emitChange();
                }
            } else {
                let midPos = position - 1;
                let midLastEle = newStr.charAt(position);
                let midSecondLastEle = newStr.charAt(midPos);
                let regex1 = /^ +$/;
                if ((midSecondLastEle.length > 0 && (midSecondLastEle.includes(' ')===true || regex1.test(midSecondLastEle) === true)
                  && (midLastEle.includes(' ') === true || regex1.test(midLastEle) === true || midLastEle.includes(' ') === false))
                  && midLastEle !== '@' || ((midSecondLastEle.length < 1 || midSecondLastEle === ' ') && midLastEle === ' ')) {
                    this.props.handleMentionView(true, groupList);
                    this.searchView = true
                }
                else {
                    this.searchView = false
                    this.props.handleMentionView(false, []);
                }
            }
        }
    }

    handleSpaceBarKey = (secondLastElement, thirdLastElement) => {
        if (this.props.chatType === CHAT_TYPE_GROUP) {
            if ((secondLastElement !== ' ' || thirdLastElement === ' ') || (secondLastElement=== ' ' && thirdLastElement !== '')
            || (secondLastElement=== ' ' && thirdLastElement === '')) {
                    this.props.handleMentionView(false, []);
            }
        }
    }
      
    handleBackspaceAndDeleteKey = (position, newStr, lastElement, secondLastElement, thirdLastElement) => {
        let selection = window.getSelection();
        let regex = /^[a-zA-Z0-9\s!@#$%^&*(),.?":{}|<>]+$/;
        const groupList = this.groupMentionUsersList();

        if (position === newStr.length) {
            if ((lastElement === '@' && secondLastElement === '@') || (lastElement === ' ' && secondLastElement === '@') ||
                (secondLastElement === "@" && (thirdLastElement === '@' || thirdLastElement === ' ' || thirdLastElement === ''))
                || (thirdLastElement === '@' && regex.test(secondLastElement) === false)) {
                    if (selection.toString().length < 1) {
                        this.props.handleMentionView(true, groupList);
                        this.searchView = true
                    }
            }
            else if ((lastElement === '@' && lastElement.length > 0 && secondLastElement.length < 1 && thirdLastElement.length < 1)
                || (lastElement === '@' && secondLastElement === ' ' && (thirdLastElement.length > 0 || thirdLastElement === ""))) {
                this.props.handleMentionView(false, []);
            }
            else {
                if (selection.toString().length > 1) {
                    this.searchView = false
                }
                this.emitChange("", true);
            }
        } else {
            const findChar= newStr.charAt(position-1);
            if (findChar === "@") this.searchView = false;
            else this.searchView = true;
        }
    }
      
    handleCtrlOrMetaKey = (e) => {
        let charCode = String.fromCharCode(e.which).toLowerCase();
        if ((e.ctrlKey && charCode === 'v') || (e.metaKey && charCode === 'v')) {
            this.props.handleImagePaste && this.props.handleImagePaste();
        }
    }
      

    currentPosition = () => {
        const position = getCaretPosition(this.typingContainner);
        this.props.setCursorPosition && this.props.setCursorPosition(position);
    }

    onFocusText = () => {
        const { id = "" } = this.props;
        setTimeout(function () {
            if (document.getElementById(id)) {
                document.getElementById(id).focus();
            }
        }, 100);//delay on page render
    };

    componentDidMount() {
        this.onFocusText(); //getAutoFocus on textBox
    }

    handleInputFieldClickable = (e) => {
        const lastElement = this.typingContainner.innerHTML.slice(-1);
        const secondLastElement = this.typingContainner.innerHTML.slice(-2, -1);
        let regex = /^ +$/;
        let position = getCaretPosition(this.typingContainner);
        if (this.props.chatType === CHAT_TYPE_GROUP) {
            const groupList = this.groupMentionUsersList();
            let s = window.getSelection();
            if (position === this.typingContainner.innerHTML.length) {
                if (lastElement === '@' && secondLastElement.length < 1 ||
                    (lastElement === '@' && secondLastElement === ' ') || 
                    lastElement === '@' && regex.test(secondLastElement) === true && secondLastElement.length > 0) {
                    if (s.toString().length < 1) {
                        this.props.handleMentionView(true, groupList);
                    }
                } else {
                    if (s.toString().length < 1) {
                        this.emitChange(null, false, false, true);
                    }
                }
            }
        }
    }

    render() {
        const { placeholder = "", id = "" } = this.props;
        let { lastHtml = "" } = this.state;
        let divId = id;
        let textContent = "";
        if (lastHtml === "") {
            textContent = placeholder || "Start Typing...";
        }
        divId = id.includes('image-preview-typingContainer') ? "" : divId;

        return (
            <div
                id={divId}
                name="typingMessage"
                contentEditable="true"
                className="typing-area"
                onInput={this.emitChange}
                onPaste={this.pasteAsPlainText}
                onKeyDown={(e) => {
                    this.onKeyDownListner(e);
                }}
                data-jest-id={"jestContentEditable"}
                data-text={textContent}
                ref={el => this.typingContainner = ReactDOM.findDOMNode(el)}
                onKeyUp={() => {
                    this.currentPosition();
                }}
                onMouseUp={() => {
                    setTimeout(() => {
                        this.currentPosition();
                    }, 0);
                }}
                onFocus={(e) => {
                    e.target.classList.add('incaption')
                }}
                onBlur={(e) => {
                    e.target.classList.remove('incaption')
                    this.props.setSelectedText && this.props.setSelectedText(getSelectedText());
                }}
                onClick={(e) => {
                    this.handleInputFieldClickable(e);
                }}
            >
            </div>)
    }
}

const mapStateToProps = (state, props) => {
    return {
        groupsMemberListData: state.groupsMemberListData,
        vCardData: state.vCardData,
    }
}
export default connect(mapStateToProps, null)(ContentEditable);
