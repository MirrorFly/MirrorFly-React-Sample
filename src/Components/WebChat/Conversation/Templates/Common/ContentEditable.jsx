import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { getCaretPosition, getSelectedText } from '../../../../../Helpers/Chat/ContentEditableEle';
import { stripTags } from '../../../../../Helpers/Utility';
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

    emitChange = (event) => {
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
    }

    onKeyDownListner = (e = {}) => {
        this.props.onKeyDownListner && this.props.onKeyDownListner(e)
        if (e.which === 13 && e.shiftKey === false) {
                e.preventDefault()
                // document.execCommand('insertHTML', false, '<br><br>');
                this.props.handleSendTextMsg()
                this.props.handleEmptyContent()
                return false;
                
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
                onKeyDown={this.onKeyDownListner}
                data-jest-id={"jestContentEditable"}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: this.props.html }}
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

export default ContentEditable;
