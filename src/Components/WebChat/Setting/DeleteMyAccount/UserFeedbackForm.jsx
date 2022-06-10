import React, { Fragment, useState } from 'react';
import { reason as reasons } from './reason';
import { DropdownArrow2, ImgLoaderWhite } from '../../../../assets/images';
import OutsideClickHandler from 'react-outside-click-handler';
import ActionInfoPopup from '../../../ActionInfoPopup';
import { blockOfflineAction, logout, stripTags } from '../../../../Helpers/Utility';
import SDK from '../../../SDK';
import { toast } from 'react-toastify';

const UserFeedbackForm = (props = {}) => {
    const maxFeedbackValue = 250;
    const [dropActive, setDropActive] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({
        errorPopup: false,
        errorMessage: "",
    });
    const { errorPopup, errorMessage } = error

    const handleDropChange = (e) => {
        setReason(e.target.value);
    };

    const handleDeletePopup = () => {
        if (reason === "") {
            setError({
                errorPopup: true,
                errorMessage: "Please select a reason"
            });
            return;
        }
        setConfirmPopup(true);
    };

    const handleDeleteConfirm = async (state) => {
        if (reason === "") {
            setError({
                errorPopup: true,
                errorMessage: "Please select a reason"
            });
            return;
        }
        if (blockOfflineAction()) return;
        setConfirmPopup(false);
        setIsLoading(true);
        await SDK.endCall();
        const deleteMyAccountResponse = await SDK.deleteMyAccount(reason, feedback);
        setIsLoading(false);
        if (deleteMyAccountResponse.statusCode === 200) {
            logout("accountDeleted");
        } else {
            toast.error("The server is not responding. Please try again later.");
        }
    };

    const onKeyPress = (e) => {
        if (e.target.innerText.length >= maxFeedbackValue) {
            e.preventDefault();
            return false;
        }
    };

    const handleFeedbackChange = (e) => {
        if (e.target.innerText.length <= maxFeedbackValue) {
            setFeedback(e.target.innerText);
        }
    }

    const pasteAsPlainTextFeedback = (e) => {
        let text = feedback + e?.clipboardData?.getData('text/plain');
        text = stripTags(text);
        if (text.length >= maxFeedbackValue) {
            e.preventDefault();
            text = text.substring(0, maxFeedbackValue)
            if (feedback.length < maxFeedbackValue) {
                document && document.execCommand('insertText', false, e?.clipboardData?.getData('text/plain').substring(0, maxFeedbackValue - feedback.length));
            }
        }
        setFeedback(text);
    }

    return (
        <Fragment>
            {isLoading && <div className="page-loader">
                <img src={ImgLoaderWhite} alt="contact-us" />
            </div>}
            <div className='user_feedback_wraper'>
                <div className='drop_custom'>
                    <label htmlFor="">
                        We hate to see you leave! Tell us why you are deleting your account:
                    </label>
                    <div className={`${dropActive ? " open " : " "} form-group `}>
                        <div className={`${dropActive ? " open " : " "} inputGroup `}>
                            <label htmlFor="country"
                                onClick={() => setDropActive(!dropActive)}
                                className={`${dropActive ? " open " : " "} dropArrow `}>
                                <DropdownArrow2
                                    onClick={() => setDropActive(!dropActive)}
                                    className={`${dropActive ? " open " : " "} `}
                                    style={{ transform: dropActive ? "rotate(-180deg)" : "rotate(0deg)" }} />
                            </label>
                            <div
                                id="country"
                                className={`${dropActive ? " open " : ""} DropContainer`}
                                onClick={() => setDropActive(!dropActive)}
                            >
                                <div
                                    onClick={() => setDropActive(!dropActive)}
                                    className={`${dropActive ? " open " : ""} selected`}>
                                    {reason ? reason : "Select a reason"}
                                </div>
                                {dropActive &&
                                    <OutsideClickHandler onOutsideClick={(event) => {
                                        if (event.target.classList.contains('open')) return
                                        setDropActive(false)
                                    }}>
                                        <div className='drop_options '>
                                            {reasons.map((reasonData) => {
                                                return (
                                                    <button type='button'
                                                        className='drop_options_list list_type_1'
                                                        onClick={handleDropChange}
                                                        value={reasonData.reason} key={reasonData.id}>
                                                        {reasonData.reason}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </OutsideClickHandler>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='form_group contentEditable_wraper'>
                        <div data-text="Tell us how we can improve" className='contentEditable' contentEditable={true} onInput={handleFeedbackChange} onKeyPress={onKeyPress} onPaste={pasteAsPlainTextFeedback}>
                        </div>
                    </div>

                    <span className='note'>We will store your feedback for future purpose.</span>
                </div>
                <div className='user_feedback_footer'>
                    <button className='btn_continue' onClick={handleDeletePopup} type="button" >
                        Delete My Account
                    </button>
                </div>
            </div>
            {confirmPopup &&
                <ActionInfoPopup
                    textActionBtn={"Ok"}
                    textCancelBtn={"Cancel"}
                    handleCancel={() => setConfirmPopup(false)}
                    handleAction={() => handleDeleteConfirm(true)}
                    textHeading={"Proceed to delete your account?"}
                    textInfo={"Deleting your account is permanent. Your data cannot be recovered if you reactivate your MirrorFly account in future."}
                />
            }
            {errorPopup &&
                <ActionInfoPopup
                    textActionBtn={"Ok"}
                    handleAction={() => setError({ ...error, errorPopup: false })}
                    textInfo={errorMessage}
                />
            }
        </Fragment>
    );
}

export default UserFeedbackForm;