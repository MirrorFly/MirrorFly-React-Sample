import React, { Component } from 'react';
import { connect } from 'react-redux';
import SampleProfile from '../../../assets/images/webcall/userDefault.svg';
import IndexedDb from '../../../Helpers/IndexedDb';
import GroupChatAvatarImg from '../../../assets/images/sample-group-profile.svg';
class WebChatProfileImg extends Component {

    /**
     * Following the states usded in WebChatProfileImg component.
     *
     * @param {boolean} status Status of the image to display the default profile image or not.
     * @param {string} profileImg Profile image file path.
     */
    constructor(props) {
        super(props);
        this.state = { profileImg: "" }
        this.localDb = new IndexedDb()
        this.mounted = false;
    }

    /**
     * componentDidMount() is one of the react lifecycle method.
     */
    componentDidMount() {
        this.handleProfileImg();
    }

    /**
     * componentDidUpdate() is one of the react lifecycle method.
     *
     * @param {object} prevProps
     * @param {object} prevState
     */
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.messageData && this.props.messageData && prevProps.messageData.id !== this.props.messageData.id) {
            this.handleBlockedProfileImg();
        }

        if (prevProps.rostersnap !== this.props.rostersnap) {
            this.handleProfileImg();
        }
    }

    /**
     * handleProfileImg() to handle the get from profile image from API call.
     */
    handleProfileImg() {
        const { rostersnap } = this.props
        this.localDb.getImageByKey(rostersnap, 'profileimages').then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            this.setState({ profileImg: blobUrl });
        }).catch(err => {
            if(!this.mounted) return
            this.setState({ profileImg: null });
        })
    }

    handleBlockedProfileImg() {
        if (this.props.messageData.data &&
            this.props.messageData.data.blockedUser === this.props.jid &&
            (this.props.messageData.data.type === "block_user" ||
            this.props.messageData.data.type === "unblock_user")) {
            return this.handleProfileImg();
        }
        return true;
    }

    componentWillUnmount() {
        this.mounted = false
    }

    checkNotFound = (event) => {
        let { avatar = SampleProfile } = this.props
        const { chatType } = this.props;
        if(chatType !== undefined && chatType === 'groupchat'){
            avatar = GroupChatAvatarImg;
        }
        event.target.src = avatar
    }
    /**
     * render() method is render the component into browser.
     */
    render() {
        return (
            <img
                src={this.state.profileImg}
                className="img-placeholder"
                alt="vcard-snap"
                onError={this.checkNotFound}
            />
        )
    }
}

/**
 * mapping redux data into WebChatConversationHeader component properties.
 */
const mapStateToProps = state => {
    return {
        messageData: state.messageData
    }
}

export default connect(mapStateToProps, null)(WebChatProfileImg);
