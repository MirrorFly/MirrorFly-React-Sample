import React, { Component, Fragment } from 'react';
import {loaderSVG} from '../../../assets/images';
import NewGroupProfile from './NewGroupProfile';
import NewParticipants from './NewParticipants';

export default class CreateNewGroup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            profileView: true,
            groupProfileImage:'',
            typingMessage:'',
            loading:false
        }
    }

    changeScreen = (groupInfo) => {
        const { typingMessage, groupProfileImage, profileImage} = groupInfo
        this.setState({
            profileView:!this.state.profileView,
            loading:true,
            typingMessage: typingMessage ? typingMessage : this.state.typingMessage,
            groupProfileImage:(profileImage) ? groupProfileImage : this.state.groupProfileImage,
        },()=>{
            this.setState({
                loading:false
            })
        })
    }

    render() {
        const { handleBackToRecentChat, vCardData } = this.props
        const { profileView,typingMessage, groupProfileImage, loading } = this.state
        const style = { width: 50, height: 50 }

        return (
            <Fragment>
                <div className="loader">
                    {loading && <img src={loaderSVG} alt="message-history" style={style} />}
                </div>
                {
                    profileView && <NewGroupProfile
                        handleBackToRecentChat={handleBackToRecentChat}
                        typingMessage={typingMessage}
                        groupProfileImage={groupProfileImage}
                        handleMoveToPartcipantList={this.changeScreen}
                    />
                }
                {
                    !profileView && <NewParticipants
                        typingMessage={typingMessage}
                        vCardData={vCardData}
                        groupProfileImage={groupProfileImage}
                        handleBackToGroup={this.changeScreen}
                        handleBackToRecentChat={handleBackToRecentChat}
                    />
                }
            </Fragment>
        )
    }
}
