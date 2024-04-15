import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import React from 'react';
import "../../assets/scss/emoji.scss";
import { getEmojiStyle } from "../../Helpers/Utility";
import OutsideClickHandler from "react-outside-click-handler";

class WebChatEmoji extends React.Component {
  /**
     * Following are the states used in WebChatEmoji Component.
     * @param {object} showEmojis to show emoji picker.
     */
  constructor(props) {
    super(props);
    this.state = {
      showEmojis: false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.showEmoji !== this.props.showEmoji) {
      this.setState({showEmojis: this.props.showEmoji})
    }
  }

  /**
   * handleShowEmojis() method to show emoji picker.
   */
  handleShowEmojis = e => {
      const { closeParentMenu } = this.props
      this.setState(
        {
          showEmojis: true,
        },
        () => {
          this.props.emojiState && this.props.emojiState(this.state.showEmojis)
          closeParentMenu && closeParentMenu();
        }
      );    
  };

  /**
   * closeMenu() method to close emoji picker.
   */
  closeMenu = (e, isClose = false) => {
    if(this.state.showEmojis === true) {
      if (this.emojiPicker !== null && !this.emojiPicker.contains(e.target) || isClose === true) {
        this.setState(
          {
            showEmojis: false
          },
          () =>{
            document.removeEventListener("click", this.closeMenu)
            this.props.emojiState && this.props.emojiState(this.state.showEmojis)
          }
        );
      }
    }  
  };

  /**
   * addEmoji() method to pass emojis to parent.
   */
  addEmoji = e => {
    let emoji = e.native;
    this.props.onEmojiClick(emoji, true);
  };

  /**
   * render() method to render the WebChatEmoji Component into browser.
   */
  render() {
    return (
      <>
        {this.state.showEmojis  &&
        <OutsideClickHandler onOutsideClick={() => setTimeout(()=>{ this.closeMenu("", true) },100)}> 
          <span className="emojiPicker-container" style={getEmojiStyle()} ref={el => (this.emojiPicker = el)}>
            <Picker 
              style={{width : "100%"}} 
              dynamicWidth={true} 
              className="emoji_picker" 
              data={data} 
              previewEmoji={false} 
              enableFrequentEmojiSort={false} 
              onEmojiSelect={this.addEmoji}
            />
          </span>
        </OutsideClickHandler>
        }
        <i className="em em-slightly_smiling_face q" onClick={(e) => {this.handleShowEmojis()}}></i>
      </>
    );
  }
}

export default WebChatEmoji;
