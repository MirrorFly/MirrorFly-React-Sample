import { Picker } from "emoji-mart";
import React from 'react';
import "emoji-mart/css/emoji-mart.css";
import "../../assets/scss/emoji.scss";
import { getEmojiStyle } from "../../Helpers/Utility";

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
        showEmojis: true
      },
      () => {
        this.props.emojiState && this.props.emojiState(this.state.showEmojis)
        closeParentMenu && closeParentMenu();
        document.addEventListener("click", this.closeMenu)
      }
    );
  };

  /**
   * closeMenu() method to close emoji picker.
   */
  closeMenu = (e, isClose = false) => {
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
  };

  /**
   * addEmoji() method to pass emojis to parent.
   */
  addEmoji = e => {
    let emoji = e.native;
    this.closeMenu("", true)
    this.props.onEmojiClick(emoji, true);
    this.props.mentionView && this.props.mentionView(true)

  };

  /**
   * render() method to render the WebChatEmoji Component into browser.
   */
  render() {
    return (
      <>
        {this.state.showEmojis &&
          <span className="emojiPicker-container" style={getEmojiStyle()} ref={el => (this.emojiPicker = el)}>
            <Picker enableFrequentEmojiSort={false} onSelect={this.addEmoji}
            />
          </span>
        }
        <i className="em em-slightly_smiling_face" onClick={(e) => this.handleShowEmojis()}></i>
      </>
    );
  }
}

export default WebChatEmoji;
