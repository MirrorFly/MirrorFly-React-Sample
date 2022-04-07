import React, { Component } from 'react';
import {SampleProfile} from '../../../assets/images';
import IndexedDb from '../../../Helpers/IndexedDb';
import GroupChatAvatarImg from '../../../assets/images/sample-group-profile.svg';
import ImageComponent from '../Common/ImageComponent';

class WebChatProfileImg extends Component {

    /**
     * Following the states usded in WebChatProfileImg component.
     *
     * @param {boolean} status Status of the image to display the default profile image or not.
     * @param {string} profileImg Profile image file path.
     */
    constructor(props) {
        super(props);
        const { avatar = SampleProfile } = this.props
        this.state = { profileImg: avatar }
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
        if (prevProps.rostersnap !== this.props.rostersnap || prevProps.chatType !== this.props.chatType) {
            this.handleProfileImg();
        }
    }

    /**
     * handleProfileImg() to handle the get from profile image from API call.
     */
    handleProfileImg() {
        let { avatar = SampleProfile } = this.props
        const { rostersnap, chatType } = this.props
        if(chatType !== undefined && chatType === 'groupchat'){
            avatar = GroupChatAvatarImg;
        }
        if(!rostersnap) {
            this.setState({ profileImg: avatar });
            return;
        }
        this.localDb.getImageByKey(rostersnap, 'profileimages').then(blob => {
            if(this.props.rostersnap){
                const blobUrl = window.URL.createObjectURL(blob);
                this.setState({ profileImg: blobUrl });
            }
        }).catch(err => {
            if (!this.mounted) return
            this.setState({ profileImg: avatar });
        })
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
            <ImageComponent
            name = {this.props.name}
            chatType={this.props.chatType}
            imageToken={this.props.rostersnap}
            />
        )
    }
}

export default WebChatProfileImg;
