import React, { useState } from 'react';
import { toast } from "react-toastify";
import './ContactUs.scss';
import OutsideClickHandler from 'react-outside-click-handler';
import Modal from '../../Common/Modal';
import { ImgLoaderWhite, Info } from '../../../../assets/images';
import SDK from '../../../SDK';
import { stripTags } from '../../../../Helpers/Utility';

const ContactUs = (props = {}) => {
    const { handlePopupClose = () => { } } = props;
    const [titleErrorMessage, setTitleErrorMessage] = useState(null);
    const [descriptionErrorMessage, setDescriptionErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const maxTitleValue = 100;
    const maxDescriptionValue = 512;

    const [inputs, setInputs] = useState({
        title: '',
        description: ''
    });

    const handleTitleChange = (e) => {
        if (e.target.value.length <= maxTitleValue) {
            setInputs({ ...inputs, [e.target.name]: e.target.value });
            if (e.target.value && e.target.value.trim() !== "") {
                setTitleErrorMessage(null);
            } else {
                setTitleErrorMessage("Title is required.");
            }
        }
    }

    const handleDescriptionChange = (e) => {
        if (e.target.innerText.length <= maxDescriptionValue) {
            setInputs({ ...inputs, "description": e.target.innerText });
            if (e.target.innerText && e.target.innerText.trim() !== "") {
                setDescriptionErrorMessage(null);
            } else {
                setDescriptionErrorMessage("Description is required.");
            }
        }
    }

    const onKeyPress = (e) => {
        if (e.target.innerText.length >= maxDescriptionValue) {
            e.preventDefault();
            return false;
        }
    }

    const pasteAsPlainTextDescription = (e) => {
        let { description } = inputs;
        let text = description + e?.clipboardData?.getData('text/plain');
        text = stripTags(text);
        if (text.length >= maxDescriptionValue) {
            e.preventDefault();
            text = text.substring(0, maxDescriptionValue);
            if (description.length < maxDescriptionValue) {
              const clipboardText = e?.clipboardData?.getData('text/plain').substring(0, maxDescriptionValue - description.length);
              if (typeof e.target === 'object' && 'setSelectionRange' in e.target) {
                const { selectionStart, selectionEnd } = e.target;
                const newText = e.target.value.substring(0, selectionStart) + clipboardText + e.target.value.substring(selectionEnd);
                e.target.value = newText;
                e.target.setSelectionRange(selectionStart + clipboardText.length, selectionStart + clipboardText.length);
              }
            }
        }          
        setInputs({ ...inputs, "description": text });
        if (text && text.trim() !== "") {
            setDescriptionErrorMessage(null);
        } else {
            setDescriptionErrorMessage("Description is required.");
        }
    }

    const pasteAsPlainTextTitle = (e) => {
        let { title } = inputs;
        const text = (title + e?.clipboardData?.getData('text/plain')).substring(0, maxTitleValue);
        setInputs({ ...inputs, [e.target.name]: text });
        if (text && text.trim() !== "") {
            setTitleErrorMessage(null);
        } else {
            setTitleErrorMessage("Title is required.");
        }
    }

    const submitButton = async () => {
        let { title, description } = inputs;
        if (!title) {
            setTitleErrorMessage("Title is required.");
        }
        if (!description) {
            setDescriptionErrorMessage("Description is required.");
        }
        if (title && title.trim() !== "" && description && description.trim() !== "") {
            setIsLoading(true);
            const submitFeedbackResponse = await SDK.sendFeedback(title, description);
            if (submitFeedbackResponse.statusCode !== 200) {
                toast.error("The server is not responding. Please try again later.");
            } else {
                toast.success("Thank you for contacting us!");
            }
            setIsLoading(false);
            handlePopupClose();
        }
    }

    return (
        <React.Fragment>
            <Modal containerId='container'>
                {isLoading && <div className="page-loader">
                    <img src={ImgLoaderWhite} alt="contact-us" />
                </div>}
                <div className='contact_us_wrapper_fixed'>
                    <OutsideClickHandler onOutsideClick={handlePopupClose}>
                        <div className='contact_us_wrapper'>
                            <div className='contact_us_header'>
                                <h4>Contact Us</h4>
                            </div>
                            <div className='contact_us_body'>
                                <form className="contact_us_form">
                                    <div className='input_wrapper'>
                                        <label htmlFor="">
                                            Title
                                        </label>
                                        <input type="text" name='title' id='title' onChange={handleTitleChange} value={inputs.title} onPaste={pasteAsPlainTextTitle} />
                                        {titleErrorMessage && <div className="errorMesage"><Info /><span>{titleErrorMessage}</span></div>}
                                    </div>
                                    <div className='input_wrapper mb-0'>
                                        <label htmlFor="">
                                            Description
                                        </label>
                                        <div contentEditable={true} className="textarea" name='description' id='description' onInput={handleDescriptionChange} onKeyPress={onKeyPress} onPaste={pasteAsPlainTextDescription}></div>
                                        {descriptionErrorMessage && <div className="errorMesage"><Info /><span>{descriptionErrorMessage}</span></div>}
                                    </div>
                                    <div className='contact_us_footer'>
                                        <div className='action_list'>
                                            <button className='default' onClick={handlePopupClose} type='button'>Cancel</button>
                                            <button className='primary' onClick={submitButton} type='button'>Send</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </OutsideClickHandler>
                </div>
            </Modal>
        </React.Fragment >
    );
}

export default ContactUs;