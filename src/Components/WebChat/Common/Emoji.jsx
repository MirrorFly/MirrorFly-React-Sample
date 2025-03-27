import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import React, { Fragment } from 'react';
import "../../../assets/scss/emoji.scss";
import { getEmojiStyle } from "../../../Helpers/Utility";

/**
 * set styling for emoji picker.
 */
const styles = {
    emojiPicker: {
        position: "absolute",
        bottom: 10,
        right: 0,
        cssFloat: "right",
        marginLeft: "200px"
    }
};

export const Emoji = (props = {}) => {
    const { onEmojiClick, emojiState = true, handleCloseEmojiClick = () => {} } = props;

    const handleOnKeyPress = React.useCallback(
      (event) => {
        if (event.key === "Escape") {
          handleCloseEmojiClick();
        }
      },
      [handleCloseEmojiClick]
    );

    React.useEffect(() => {
      if (!emojiState) return;
      document.addEventListener("keydown", handleOnKeyPress, false);
      return () => document.removeEventListener("keydown", handleOnKeyPress, false);
    }, [emojiState, handleOnKeyPress]); 
      
    /**
     * addEmoji() method to pass emojis to parent.
     */
    const addEmoji = (e = {}) => {
        let emoji = e.native;
        onEmojiClick(emoji);
    };

    return (
        <Fragment>
            { emojiState && <span className="emojiPicker-container" style={getEmojiStyle()}>
            <Picker className="emoji_picker" style={{width : "100%"}} dynamicWidth={true} data={data} previewEmoji={false} enableFrequentEmojiSort={false} onEmojiSelect={addEmoji} />
            </span>}
        </Fragment>
    )
}
