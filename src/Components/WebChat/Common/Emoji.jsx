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
    const { onEmojiClick, emojiState = true } = props
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
            <Picker className="emoji_picker" style={{width : "100%"}} data={data} perLine={23} previewEmoji={false} enableFrequentEmojiSort={false} onEmojiSelect={addEmoji} />
            </span>}
        </Fragment>
    )
}
