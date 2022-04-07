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
export const getCaretPosition = (element) => {
    if (!element) return 0;
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    let sel = doc.selection
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if (sel?.type !== "Control") {
        var textRange = sel?.createRange();
        var preCaretTextRange = doc?.body?.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
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
            for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);

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
    return runes.substr(str, 0, numCharRes);
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
