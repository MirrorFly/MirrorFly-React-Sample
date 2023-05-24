import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import React, { Component } from 'react';
import { stripTags } from '../../../../../Helpers/Utility';
import { getCaretPosition, getSelectedText } from '../../../../../Helpers/Chat/ContentEditableEle';
import { getUserDetails } from '../../../../../Helpers/Chat/User';


class ContentEditable extends Component {
    constructor(props = {}) {
        super(props)
        this.state = {
            lastHtml: ''
        }
    }


    shouldComponentUpdate(nextProps) {
        if (this.props.chatScreenName && this.props.chatScreenName === "conversationScreen") {
            this.onFocusText();
        }
        return nextProps.html !== this.typingContainner.innerHTML;
    }

    componentDidUpdate() {
        if (this.props.html !== this.typingContainner.innerHTML) {
            this.typingContainner.innerHTML = this.props.html;
        }
    }

    pasteAsPlainText = (event = {}) => {
        event.preventDefault()
        const text = event?.clipboardData?.getData('text/plain')
        document && document.execCommand('insertHTML', false, stripTags(text))
    }


    emitChange = (event) => {
        let html = this.typingContainner.innerHTML;

        if (!html && html.replace(/^\s+/, "") === html || this.typingContainner.innerHTML === "<br>") {
            this.props.handleEmptyContent();
            this.setState({ lastHtml: "" });
            return
        }
        if (this.props.handleMessage) {
            this.props.onInputListener()
            this.props.handleMessage({
                target: {
                    value: html
                }
            });
        }

        this.lastHtml = html;
        const lastElement = html.slice(-1);
        const secondLastElement = html.slice(-2, -1);
        const thirdLastElement = html.slice(-3, -2);
        if (this.props.chatType === "groupchat") {
            if (html.length > 1) {
                if ((lastElement === '@' && secondLastElement === '@')
                    || (lastElement === '@' && secondLastElement !== ' ')
                    || (lastElement === ' ' && secondLastElement === '@' && thirdLastElement === '@')) {
                    this.props.handleMentionView(false, [])
                    return
                }
                else if (lastElement === '@' && secondLastElement === ' ' && thirdLastElement === '@') {
                    this.props.handleMentionView(true, this.groupMentionUsersList())
                }
            }

            //Handles the search in mention Popup
            const pattern = /\B@\.*/g;
            if (html.match(pattern)) {
                const filteredHtml = html.includes('@') && html.substr(html.lastIndexOf('@') + 1).split(' ')[0];
                this.props.handleSearchView(filteredHtml);
            }
        }
    }

    groupMentionUsersList = () => {
        const groupMemberList = this.props.groupsMemberListData?.data?.participants;
        let grouplist = groupMemberList.filter(participants => participants.userId !== this.props.vCardData.data.userId);
        grouplist = grouplist.map((obj) => {
            obj.rosterData = getUserDetails(obj.userId)
            return obj;
        });
        return grouplist;
    }


    onKeyDownListner = (e = {}) => {
        this.props.onKeyDownListner && this.props.onKeyDownListner(e)
        const lastElement = this.typingContainner.innerHTML.slice(-1);
        const secondLastElement = this.typingContainner.innerHTML.slice(-2, -1);
        const thirdLastElement = this.typingContainner.innerHTML.slice(-3, -2);
        var regex = /^[a-zA-Z0-9\s!@#$%^&*(),.?":{}|<>]+$/;
        if (e.which === 37) {
            if (this.props.chatType === "groupchat") {
                if (secondLastElement !== "@" && thirdLastElement.length < 1 ||
                    (secondLastElement !== "@" && thirdLastElement !== " ")) {
                    this.props.handleMentionView(false, []);
                }
            }
        }
        if (e.which === 13 && e.shiftKey === false) {
            e.preventDefault()
            if (this.typingContainner.innerHTML.replace(/^\s+/, "") === "" ||
                this.typingContainner.innerHTML.includes("<div><br></div>")) {
                return false;
            }
            this.props.handleSendTextMsg()
            this.props.handleEmptyContent()
            this.props.handleMentionView && this.props.handleMentionView(false, []);
            this.setState({ lastHtml: "" })
            return false;
        }
        if (e.which === 50 && e.shiftKey === true) {
            if (this.props.chatType === "groupchat") {
                const groupList = this.groupMentionUsersList();
                if (lastElement === '' || secondLastElement === '@' ||
                    (secondLastElement === '@' && thirdLastElement === '@') ||
                    (lastElement === ' ' && secondLastElement === ' ') || (lastElement === ' ' && secondLastElement !== ' ')) {
                    this.props.handleMentionView(true, groupList);
                    this.emitChange();
                }
            }
        }
        if (e.which ===  8 || e.which === 46 || e.which === 32) {
            if(this.props.chatType === "groupchat"){
                const groupList = this.groupMentionUsersList();
                if (e.which === 8 || e.which === 46) {
                    if ((lastElement === '@' && secondLastElement === '@') || (lastElement === ' ' && secondLastElement === '@') ||
                        (secondLastElement === "@" && (thirdLastElement === '@' || thirdLastElement === ' ' || thirdLastElement === ''))
                        || (thirdLastElement === '@' && regex.test(secondLastElement) === false)) {
                        this.props.handleMentionView(true, groupList);
                    }
                    else if ((lastElement === '@' && lastElement.length > 0 && secondLastElement.length < 1 && thirdLastElement.length < 1)
                        || (lastElement === '@' && secondLastElement === ' ' && (thirdLastElement.length > 0 || thirdLastElement === ""))) {
                        this.props.handleMentionView(false, []);
                    }
                    else{
                        this.emitChange();
                    }
                }
                else if(e.which === 32){
                  if((secondLastElement !== ' ' || thirdLastElement === ' ') ||
                   (secondLastElement=== ' ' && thirdLastElement !== '') || (secondLastElement=== ' ' && thirdLastElement === '')){
                    this.props.handleMentionView(false, []);
                    return
                  }
                }       

                let s = window.getSelection();
                let r = s.getRangeAt(0);
                let el = r.startContainer.parentElement;
                // Check if the current element is the .label
                if (el.classList.contains('mentioned')) {
                    // Check if we are exactly at the end of the .label element
                    if ((r.startOffset === r.endOffset && r.endOffset === el.textContent.length) || s.toString() ){
                        // prevent the default delete behavior
                        e.preventDefault();
                        el.remove();  
                        this.emitChange()
                        this.props.handleDeleteMentionedUser(el);

                        // Handling the content selection with mentioned when backspace triggers
                        if(s.toString()){
                            this.setState({isSelected: false})
                            this.props.handleEmptyContent()
                            this.setState({lastHtml: ""})
                            return
                        }
                        return;
                    }
                }
            }  
            const position = getCaretPosition(this.typingContainner);
            if (position === this.typingContainner.textContent.length) {
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
            let charCode = String.fromCharCode(e.which).toLowerCase();
            if (e.ctrlKey && charCode === 'v' || e.metaKey && charCode === 'v') {
                this.props.handleImagePaste()
            }
        }
        return true;
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
        this.onFocusText();//getAutoFocus on textBox

    }

    handleInputFieldClickable = (e) => {
        const lastElement = this.typingContainner.innerHTML.slice(-1);
        const secondLastElement = this.typingContainner.innerHTML.slice(-2, -1);
        const position = getCaretPosition(this.typingContainner);
        if (this.props.chatType === "groupchat") {
            const groupList = this.groupMentionUsersList();
            if (position === this.typingContainner.textContent.length) {
                if (lastElement === '@' && secondLastElement.length < 1 ||
                    (lastElement === '@' && secondLastElement === ' ')) {
                    this.props.handleMentionView(true, groupList);
                }
            }
        }
    }

    render() {
        const { placeholder = "", id = "" } = this.props;
        let { lastHtml = "" } = this.state;
        return (
            <div
                id={id}
                name="typingMessage"
                contentEditable="true"
                className="typing-area"
                onInput={this.emitChange}
                onPaste={this.pasteAsPlainText}
                onKeyDown={(e) => {
                    this.onKeyDownListner(e);
                }}
                data-jest-id={"jestContentEditable"}
                data-text={lastHtml === "" ? (placeholder ? placeholder : "Start Typing...") : ""}
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
                onClick={(e) => { this.handleInputFieldClickable(e) }}
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
