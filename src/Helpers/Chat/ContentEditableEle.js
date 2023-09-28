import runes from "runes";


export const getSelectedText = () => {
    let selectedText = '';

    // window.getSelection
    if (window.getSelection) {
        selectedText = window.getSelection();
    }
    // document.getSelection
    else if (document.getSelection) {
        selectedText = document.getSelection();
    }
    // document.selection
    else if (document.selection) {
        selectedText = document.selection.createRange().text;
    }
    return selectedText && selectedText.toString && selectedText.toString();
}

export const getCaretPosition = (node) => {
    let range = window.getSelection().getRangeAt(0),
    preCaretRange = range.cloneRange(),
    caretPosition,
    tmp = document.createElement("div");
    preCaretRange.selectNodeContents(node);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    tmp.appendChild(preCaretRange.cloneContents());
    caretPosition = tmp.innerHTML.length;
    return caretPosition;
}

const createRange = (node, chars, range) => {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
            for (let lp of node.childNodes) {
                range = createRange(lp, chars, range);
                if (chars.count === 0) {
                  break;
                }
            }              
        }
    }
    return range;
};

/**
 * @param  {string} str=""
 * remove 1024 char restrict
 * runes using emonji splice
 */
export const removeMoreNumberChar = (numCharRes = 0, str = "") => {
    try{
        return runes.substr(str, 0, numCharRes);
    } catch(e) {}
};

/**
 * Set cursor postion for content editable element
 * @param {*} element
 * @param {*} pos
 */
export const setCaretPosition = (element, pos) => {
    if (!element) return;
    if (pos >= 0) {
        const selection = window.getSelection();
        const range = createRange(element.parentNode, { count: pos });
        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

/**
 * Set cursor position for input(textbox) element
 * @param {*} element
 * @param {*} pos
 */
export const setInputCaretPosition = (element, pos) => {
    if (element.selectionStart) {
        element.focus();
        element.setSelectionRange(pos, pos);
    }
    else {
        element.focus();
    }
}
