import { Picker } from "emoji-mart";
import React, { Fragment } from 'react';
import "emoji-mart/css/emoji-mart.css";
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
                <Picker enableFrequentEmojiSort={false} onSelect={addEmoji} />
            </span>}
        </Fragment>
    )
}
