import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import React, { Component } from 'react';
import { stripTags } from '../../../../../Helpers/Utility';
import { getCaretPosition, getSelectedText } from '../../../../../Helpers/Chat/ContentEditableEle';


class ContentEditable extends Component {
    constructor(props = {}) {
        super(props)
        this.lastHtml = '';
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
        event.preventDefault()
        const text = event?.clipboardData?.getData('text/plain')
        document && document.execCommand('insertHTML', false, stripTags(text))
    }


    emitChange = (event ) => {
        var html = this.typingContainner.innerHTML;        
      if (this.props.handleMessage) {
            this.props.onInputListener()
            this.props.handleMessage({
                target: {
                    value: html
                }
            });
        }
        if (!html && html.replace(/^\s+/, "") === html) {
            return
        }
        this.lastHtml = html;
        const pattern = /\B@\w+/g;
                if( html.match(pattern)){
                    const filteredHtml =  html.includes('@') && html.substr(html.lastIndexOf('@') + 1).split(' ')[0];
                    this.props.handleSearchView(filteredHtml);
                }
    }


    onKeyDownListner = (e = {}) => {
        this.props.onKeyDownListner && this.props.onKeyDownListner(e)
        if (e.which === 13 && e.shiftKey === false) {
            e.preventDefault()
            this.props.handleSendTextMsg()
            this.props.handleEmptyContent()
            return false;
        }
        if(e.which === 50 && e.shiftKey === true){
            if (this.props.chatType === "groupchat") {
                   const groupMemberList = this.props.groupsMemberListData.data.participants;
                   const grouplist = groupMemberList.filter(participants=>participants.userId !== this.props.vCardData.data.userId);
                   this.props.handleMentionView(true,  grouplist);
                   this.emitChange();
            }
        }
        if (e.which ===  8 || e.which === 46) {
            let s = window.getSelection();
            let r = s.getRangeAt(0);
            let el = r.startContainer.parentElement;
            // Check if the current element is the .label
            if (el.classList.contains('mentioned')) {
                // Check if we are exactly at the end of the .label element
                if (r.startOffset === r.endOffset && r.endOffset === el.textContent.length) {
                    // prevent the default delete behavior
                    e.preventDefault();
                    el.remove();  
                    this.props.handleDeleteMentionedUser(el)
                    return;
                }
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

    render() {
        const { placeholder = "", id = "" } = this.props;
    
        return (
            <div
                id={id}
                name="typingMessage"
                contentEditable="true"
                className="typing-area"
                onInput={this.emitChange}
                onPaste={this.pasteAsPlainText}
                onKeyDown={(e) =>{
                    this.onKeyDownListner(e);
                }}
                data-jest-id={"jestContentEditable"}
                data-text={placeholder ? placeholder : "Start typing..."}
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
            >
            
            </div>)
    }
}

const mapStateToProps = (state, props) => {
    return {
        groupsMemberListData: state.groupsMemberListData,
        vCardData:state.vCardData,
    }
}
export default connect(mapStateToProps, null)(ContentEditable);
