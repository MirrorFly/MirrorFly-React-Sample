import React from 'react';
import { connect } from 'react-redux';
import _toArray from "lodash/toArray";
import renderHTML from 'react-render-html';
import toastr from "toastr";
import { Done, Edit, InfoIcon, Status } from '../../../assets/images';
import "../../../assets/scss/minEmoji.scss";
import {
    REACT_APP_PROFILE_NAME_CHAR,
    REACT_APP_STATUS_CHAR,
    VIEW_PROFILE_INFO,
    YOUR_STATUS
} from '../../processENV';
import SDK from '../../SDK';
import WebChatEmoji from '../WebChatEmoji';
import { getSelectedText, removeMoreNumberChar, setInputCaretPosition } from '../../../Helpers/Chat/ContentEditableEle';
import { blockOfflineAction } from '../../../Helpers/Utility';

class WebChatFields extends React.Component {
    /**
     * Following the states used in WebChatFields Component.
     *
     * @param {object} vCardData VCard Data set into this state.
     * @param {string} userName username input to maintain in this state.
     * @param {string} userStatus status input to maintain in this state.
     * @param {boolean} viewEdit Display the editable field for username field.
     * @param {boolean} viewEditStatus Display the editable field for status field.
     * @param {boolean} charCount Display the charCount for username field.
     * @param {boolean} charCountStatus Display the charCount for status field.
     * @param {string} userNameChars Display the characters left for username field.
     * @param {string} statusChars Display the characters left for status field.
     */
    constructor(props) {
        super(props);
        this.state = {
            vCardData: "",
            userName: "",
            userStatus: "",
            viewEdit: true,
            viewEditStatus: true,
            viewTick: true,
            viewTickStatus: true,
            charCount: false,
            charCountStatus: false,
            userNameChars: REACT_APP_PROFILE_NAME_CHAR,
            statusChars: REACT_APP_STATUS_CHAR,
            lastUserName: '',
            lastUserStatus: ''
        }
        this.userNameCursorPostion = 0;
        this.userNameSelectedText = '';
        this.userStatusCursorPostion = 0;
        this.userStatusSelectedText = '';
    }

    findNegativeValue = (message = "", lengthData = 0) => {
        const groupNameLength = lengthData - _toArray(message).length;
        if (groupNameLength >= 0) {
            return lengthData - _toArray(message).length;
        }
        return 0;
    };

    /**
     * componentDidMount() method is one of the lifecycle method.
     *
     * In this method to handle loader status and input fields.
     */
    componentDidMount() {
        if ((this.props.vCardData && this.props.vCardData.id) || this.state.vCardData.length !== 0) {
            this.setState({
                vCardData: this.props.vCardData.data,
                userName: this.props.vCardData.data.nickName,
                userStatus: this.props.vCardData.data.status,
                userNameChars: this.findNegativeValue(this.props.vCardData.data.nickName, REACT_APP_PROFILE_NAME_CHAR),
                statusChars: this.findNegativeValue(this.props.vCardData.data.status, REACT_APP_STATUS_CHAR),
            });
        }
    }

    /**
     * componentDidUpdate() method to check the prevProps and current props vCardData and update the input fields.
     *
     * @param {object} prevProps
     * @param {object} prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.vCardData && prevProps.vCardData.id !== this.props.vCardData.id) {
            this.setState({
                vCardData: this.props.vCardData.data,
                userName: this.props.vCardData.data.nickName,
                userStatus: this.props.vCardData.data.status,
                userNameChars: this.findNegativeValue(this.props.vCardData.data.nickName, REACT_APP_PROFILE_NAME_CHAR),
                statusChars: this.findNegativeValue(this.props.vCardData.data.status, REACT_APP_STATUS_CHAR)
            });
            if (prevProps.vCardData.data && prevProps.vCardData.data.nickName === this.props.vCardData.data.nickName) {
                this.handleSetNickname();
            }
            if (prevProps.vCardData.data && prevProps.vCardData.data.status === this.props.vCardData.data.status) {
                this.handleSetStatus();
            }
            if (prevProps.vCardData.data && prevProps.vCardData.data.nickName !== this.props.vCardData.data.nickName && prevProps.vCardData.data.status === this.props.vCardData.data.status) {
                this.handleSetStatus();
            }
            if (prevProps.vCardData.data && prevProps.vCardData.data.status !== this.props.vCardData.data.status && prevProps.vCardData.data.nickName === this.props.vCardData.data.nickName) {
                this.handleSetNickname();
            }
            if (prevProps.vCardData.data && prevProps.vCardData.data.image !== this.props.vCardData.data.image && prevProps.vCardData.data.status === this.props.vCardData.data.status &&
                prevProps.vCardData.data.nickName === this.props.vCardData.data.nickName) {
                this.handleSetNickname();
                this.handleSetStatus();
            }
        }
    }

    /**
     * handleSetNickname() method to maintain state for username field.
     */
    handleSetNickname = () => {
        this.handleUserNameState();
    }

    /**
     * handleSetStatus() method to maintain state for status field.
     */
    handleSetStatus = () => {
        this.handleUserStateState();
    }

    /**
     * handleUserNameState() method to maintain state for username field.
     */
    handleUserNameState = () => {
        this.setState({
            userName: this.state.userName,
            userNameChars: this.state.userNameChars
        });
    }

    /**
     * handleUserStateState() method to maintain state for status field.
     */
    handleUserStateState = () => {
        this.setState({
            userStatus: this.state.userStatus,
            statusChars: this.state.statusChars
        });
    }

    /**
     * handleVcardSaveUsername() method to store username for view profile.
     */
    handleVcardSaveUsername = async (e) => {
        if (blockOfflineAction()) return;
        let { vCardData, userName } = this.state;
        userName = userName.trim();
        if (userName.length < 3) {
            toastr.clear();
            toastr.error('Username is too short');
            return;
        }
        if (userName !== "") {
            let mobileno = vCardData.mobileNumber;
            let profileImage = "";
            if(vCardData.thumbImage !== "") profileImage = vCardData.thumbImage;
            else profileImage = vCardData.image;
            const isUserNameChanged = this.state.lastUserName !== userName;
            let response = isUserNameChanged ? await SDK.setUserProfile(userName, profileImage, vCardData.status, mobileno, vCardData.email) : {};
            if (response.statusCode === 200 || !isUserNameChanged) {
                this.setState({
                    userNameChars: this.findNegativeValue(this.props.vCardData.data.nickName, REACT_APP_PROFILE_NAME_CHAR),
                    viewEdit: true,
                    charCount: false,
                    viewTick: true,
                    userName,
                    userStatus: this.state.userStatus
                });
                isUserNameChanged && toastr.success('Profile updated successfully');
            } else {
                toastr.error(response.message);
            }
        }
    }

    /**
     * handleVcardSaveStatus() method to store status for view profile.
     */
    handleVcardSaveStatus = async (e) => {
        if (blockOfflineAction()) return;
        let { vCardData, userStatus } = this.state;
        userStatus = userStatus.trim();
        if (userStatus !== "") {
            let mobileno = vCardData.mobileNumber;
            let profileImage = "";
            if(vCardData.thumbImage !== "") profileImage = vCardData.thumbImage;
            else profileImage = vCardData.image;
            const isUserStatusChanged = this.state.lastUserStatus !== userStatus;
            let response = isUserStatusChanged ? await SDK.setUserProfile(vCardData.nickName, profileImage, userStatus, mobileno, vCardData.email) : {};
            if (response.statusCode === 200 || !isUserStatusChanged) {
                this.setState({
                    statusChars: this.findNegativeValue(this.props.vCardData.data.status, REACT_APP_STATUS_CHAR),
                    viewEditStatus: true,
                    charCountStatus: false,
                    viewTickStatus: true,
                    userStatus,
                    userName: this.state.userName
                });
                isUserStatusChanged && toastr.success('Profile updated successfully');
            } else {
                toastr.error(response.message);
            }
        }
    }

    /**
     * handleWordCountStatus() method to maintain state for characters left for status field.
     */
    handleWordCountStatus = event => {
        const user_statusLength = event.target.value;
        const charLeftStatus = this.findNegativeValue(user_statusLength, REACT_APP_STATUS_CHAR);
        var user_Status = event.target.value;
        this.setState({ statusChars: charLeftStatus, userStatus: user_Status });
        (charLeftStatus === REACT_APP_STATUS_CHAR) ? this.setState({ viewTickStatus: true }) : this.setState({ viewTickStatus: false })
        this.handleTrim("status", "viewTickStatus");
    }

    /**
     * handleTrim() method to restict the space value in the beginning of input field.
     */
    handleTrim(element, stateName) {
        var valID = document.getElementById(element).id;
        var valString = document.getElementById(element).value;
        if ((valID === element) && valString.trim() === "") {
            this.setState({ [stateName]: true });
        }
    }


    /**
       * handleWordCount() method to maintain state for characters left for username field.
       */
    handleWordCount = event => {
        const userName = event.target.value;
        const message = removeMoreNumberChar(REACT_APP_PROFILE_NAME_CHAR, userName);
        const charLeft = this.findNegativeValue(message, REACT_APP_PROFILE_NAME_CHAR);

        this.setState({ userNameChars: charLeft, userName }, () => {
            (this.state.userNameChars < 0) ? this.setState({ userNameChars: 0 }) : this.setState({ userNameChars: this.state.userNameChars });
        });
        (charLeft === REACT_APP_PROFILE_NAME_CHAR) ? this.setState({ viewTick: true }) : this.setState({ viewTick: false })
        this.handleTrim("username", "viewTick");
    }
    /**
     * onEmojiClick() method to maintain state to append username and emoji in username field.
     */
    onEmojiClickUsername = (emojiObject) => {
        const { userName: userNickName = "" } = this.state;
        const conditionCheck = this.findNegativeValue(userNickName, REACT_APP_PROFILE_NAME_CHAR) > 0 ? true : false;
        if (conditionCheck) {
            let cursorPosition = this.userNameCursorPostion;
            let userName = '';

            if (this.userNameSelectedText === this.state.userName) {
                userName = emojiObject;
                cursorPosition = emojiObject.length;
            }
            else {
                const start = this.state.userName.substring(0, cursorPosition);
                const end = this.state.userName.substring(cursorPosition);
                userName = start + emojiObject + end;
                cursorPosition = cursorPosition + emojiObject.length;
            }

            const charLeft = this.findNegativeValue(userName, REACT_APP_PROFILE_NAME_CHAR);
            this.setState({ userNameChars: charLeft, userName }, () => {
                this.userNameCursorPostion = cursorPosition;
                setInputCaretPosition(document.getElementById("username"), cursorPosition);
            });
            (charLeft === REACT_APP_PROFILE_NAME_CHAR) ? this.setState({ viewTick: true }) : this.setState({ viewTick: false })
        }
    }

    /**
     * onEmojiClickStatus() method to maintain state to append status and emoji in username field.
     */
    onEmojiClickStatus = (emojiObject) => {
        const { userStatus: userStatusText = "" } = this.state;
        const conditionCheck = this.findNegativeValue(userStatusText, REACT_APP_STATUS_CHAR) > 0 ? true : false;
        if (conditionCheck) {
            let cursorPosition = this.userStatusCursorPostion;
            let userStatus = '';

            if (this.userStatusSelectedText === this.state.userStatus) {
                userStatus = emojiObject;
                cursorPosition = emojiObject.length;
            }
            else {
                const start = this.state.userStatus.substring(0, cursorPosition);
                const end = this.state.userStatus.substring(cursorPosition);
                userStatus = start + emojiObject + end;
                cursorPosition = cursorPosition + emojiObject.length;
            }

            const charLeftStatus = this.findNegativeValue(userStatus, REACT_APP_STATUS_CHAR);
            this.setState({ statusChars: charLeftStatus, userStatus }, () => {
                this.userStatusCursorPostion = cursorPosition;
                setInputCaretPosition(document.getElementById("status"), cursorPosition);
            });
            (charLeftStatus === REACT_APP_STATUS_CHAR) ? this.setState({ viewTickStatus: true }) : this.setState({ viewTickStatus: false })
        }
    }

    /**
     * handleEdit() method to maintain state for Edit username field.
     */
    handleEdit(e) {
        if (blockOfflineAction()) return;
        this.userNameCursorPostion = this.state.userName.length;
        this.setState({ viewEdit: false, viewTick: false, charCount: true, lastUserName: this.state.userName });
    }

    /**
     * handleEditStatus() method to maintain state for Edit status field.
     */
    handleEditStatus(e) {
        if (blockOfflineAction()) return;
        this.userStatusCursorPostion = this.state.userStatus.length;
        this.setState({ viewEditStatus: false, viewTickStatus: false, charCountStatus: true, lastUserStatus: this.state.userStatus });
    }

    /**
     * handleEmoji(e) method to maintain state for emoji box to open/close.
     */
    handleEmoji(e) {
        this.setState({ viewEmoji: !this.state.viewEmoji });
    }

    /**
     * render() method to render the WebChatFields Component into browser.
     */
    render() {
        let { viewEditStatus,
            viewEdit,
            charCount,
            charCountStatus,
            userName,
            userStatus,
            viewTick,
            viewTickStatus
        } = this.state;
        return (
            <>
                <div className="profile">
                    <div className="profile-details username" title="Edit name">
                        <i className="status"><Status /></i>
                        <div className="form-control">
                            {!viewEdit &&
                                <input
                                    type="text"
                                    autoComplete="off"
                                    value={userName}
                                    maxLength={this.findNegativeValue(userName, REACT_APP_PROFILE_NAME_CHAR) > 0 ? 1000 : 0}
                                    placeholder="Username"
                                    id="username"
                                    name="userName"
                                    onChange={this.handleWordCount}
                                    autoFocus
                                    onMouseUp={(e) => {
                                        this.userNameCursorPostion = e.target.selectionStart;
                                    }}
                                    onKeyUp={(e) => {
                                        this.userNameCursorPostion = e.target.selectionStart;
                                    }}
                                    onBlur={(e) => {
                                        this.userNameSelectedText = getSelectedText();
                                    }}
                                ></input>}
                            {charCount && <span className="char-count">
                                {this.state.userNameChars}
                            </span>}
                            {!viewEdit && <i className="emoji">
                                <WebChatEmoji onEmojiClick={this.onEmojiClickUsername} />
                            </i>}{viewEdit && <h4>
                                {renderHTML(userName)}
                            </h4>}
                        </div>
                        <div className="controls">
                            {!viewTick && <i className="done"
                                onClick={(e) => this.handleVcardSaveUsername()}
                            ><Done /></i>}
                            {viewEdit && <i className="edit" onClick={(e) => this.handleEdit()}><Edit /></i>}
                        </div>
                    </div>
                    <label className="">{YOUR_STATUS}</label>
                    <div className="profile-details status" title="Edit status">
                        <i className="status"><Status /></i>
                        <div className="form-control">
                            {!viewEditStatus &&
                                <input
                                    type="text"
                                    value={userStatus}
                                    autoComplete="off"
                                    placeholder="Status"
                                    id="status"
                                    name="userStatus"
                                    onChange={this.handleWordCountStatus}
                                    maxLength={this.findNegativeValue(userStatus, REACT_APP_STATUS_CHAR) > 0 ? 1000 : 0}
                                    autoFocus
                                    onMouseUp={(e) => {
                                        this.userStatusCursorPostion = e.target.selectionStart;
                                    }}
                                    onKeyUp={(e) => {
                                        this.userStatusCursorPostion = e.target.selectionStart;
                                    }}
                                    onBlur={(e) => {
                                        this.userStatusSelectedText = getSelectedText();
                                    }}
                                ></input>}
                            {charCountStatus && <span className="char-count">
                                {this.state.statusChars}
                            </span>}
                            {!viewEditStatus && <i className="emoji">
                                <WebChatEmoji onEmojiClick={this.onEmojiClickStatus} />
                            </i>}{viewEditStatus && <h4>
                                {renderHTML(userStatus)}
                            </h4>}
                        </div>
                        <div className="controls">
                            {!viewTickStatus && <i className="done"
                                onClick={(e) => this.handleVcardSaveStatus()}
                            ><Done /></i>}
                            {viewEditStatus &&
                                <i className="edit" onClick={(e) => this.handleEditStatus()}><Edit /></i>}
                        </div>
                    </div>
                    <div className="info">
                        <i> <InfoIcon /> </i>
                        <span>{VIEW_PROFILE_INFO}</span>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state, props) => {
    return ({
        vCardData: state.vCardData
    });
};

export default connect(mapStateToProps, null)(WebChatFields);
