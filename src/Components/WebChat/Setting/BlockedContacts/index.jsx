import React, { Component } from 'react';
import { connect } from 'react-redux';
import SDK from '../../../SDK';
import ProfileImage from '../../Common/ProfileImage';
import Modal from '../../Common/Modal';
import { BlockPopUp } from '../../PopUp/BlockPopUp';
import {Noblocked } from '../images';
import { SettingsHeader } from '../Settings';
import './BlockedContacts.scss';
import { getContactNameFromRoster, formatUserIdToJid } from '../../../../Helpers/Chat/User';
import UserStatus from '../../Common/UserStatus';
import { toast } from 'react-toastify';
import { updateBlockedContactAction } from '../../../../Actions/BlockAction';
import { CHAT_TYPE_SINGLE, UNBLOCK_CONTACT_TYPE } from '../../../../Helpers/Chat/Constant';
import Store from '../../../../Store';
import { handleTempArchivedChats } from '../../../../Helpers/Chat/ChatHelper';
import {getFromLocalStorageAndDecrypt} from '../../WebChatEncryptDecrypt';

class BlockedContacts extends Component {

   constructor(props) {
      super(props)
      this.state = {
         contactDetails: [],
         showModal:false,
         nameToDisplay:'',
         userId:null
      }
   }

   componentDidMount() {
      this.prepareToDisplay()
   }

   componentDidUpdate(prevProps) {
      const { blockedContact: { id } = {} } = this.props;
      const prevBlockId = prevProps?.blockedContact?.id
      if ((prevBlockId && prevBlockId !== id) || (prevProps.rosterData && prevProps.rosterData.id !== this.props.rosterData.id)) {
         this.prepareToDisplay()
      }
   }

   prepareToDisplay = () => {
      const { rosterData: { data: rosterDataArray = [] } = {},
      blockedContact: { data: blockedContactArr = [] } = {} } = this.props;
      const contactDetails = rosterDataArray.filter((profile) => {
         let rosterJid = (profile.username) ? profile.username : profile.userJid;
         rosterJid = !rosterJid ? profile.userId : rosterJid;
         if(!rosterJid || rosterJid.indexOf('@mix') > -1) return false;
         rosterJid = formatUserIdToJid(rosterJid);
         return blockedContactArr.indexOf(rosterJid) > -1;
      });

      this.setState({
         contactDetails: contactDetails
      })
   }

   popUpToggleAction = (userId, nameToDisplay) => {
      this.setState({
         showModal:!this.state.showModal,
         blockId:userId || null,
         nameToDisplay:nameToDisplay || null
      })
   }

   dispatchAction =()=>{
      const { blockId, nameToDisplay } = this.state
      this.setState({
         showModal:!this.state.showModal
      },async ()=>{
         const res = await SDK.unblockUser(blockId);
         if(res && res.statusCode === 200){
            Store.dispatch(updateBlockedContactAction(blockId, UNBLOCK_CONTACT_TYPE));
            toast.success(`${nameToDisplay || 'User'} has been Unblocked`);
            handleTempArchivedChats(blockId, CHAT_TYPE_SINGLE);
         }
      })
   }

   renderProfile = () => {
      const { contactDetails } = this.state
      if (contactDetails.length === 0) return null
      const token = getFromLocalStorageAndDecrypt('token');
      return contactDetails.map((contact, index) => {
         const { chatType, image, thumbImage, emailId, statusMsg, status, userId, userJid } = contact
         const nameToDisplay = getContactNameFromRoster(contact)
         return (
            <li key={userId} className="chat-list-li">
               <ProfileImage
                  chatType={chatType || CHAT_TYPE_SINGLE}
                  userToken={token}
                  imageToken={(thumbImage && thumbImage !== "") ? thumbImage : image}
                  emailId={emailId}
                  userId={userId}
                  name={nameToDisplay}
               />
               <div className="recentchats">
                  <div className="recent-username-block">
                     <div className="recent-username">
                        <div className="username">
                           <h3 title={nameToDisplay}>{nameToDisplay}</h3>
                        </div>
                     </div>
                  </div>
                  <div className="recent-message-block">
                     <UserStatus status={statusMsg || status} userId={userId} />
                  </div>
               </div>
               <span className="Unblock" onClick={() => { this.popUpToggleAction(userJid,nameToDisplay) }}>Unblock</span>
            </li>
         )
      })
   }

   render() {
      const { handleBackToSetting } = this.props
      let { contactDetails, showModal,nameToDisplay } = this.state
      return (
         <div className="setting-container">
            {showModal && <Modal containerId='container'>
               <BlockPopUp
                  popUpToggleAction={this.popUpToggleAction}
                  dispatchAction={this.dispatchAction}
                  headerLabel={<>{'Unblock'} {nameToDisplay} ?</>}
                  closeLabel={'Cancel'}
                  actionLabel={'Unblock'}
                  infoLabel={'On unblocking, this contact will be able to call you or send messages to you.'}
               />
            </Modal>}
            <div>
               <div className="settinglist ">
                  <SettingsHeader
                     handleBackFromSetting={handleBackToSetting}
                     label={'Blocked Contacts'}
                  />
                  {contactDetails.length > 0 &&
                     <ul className="chat-list-ul BlockedList">
                        {this.renderProfile()}
                     </ul>
                  }
                  {contactDetails.length === 0 &&
                     <div className="setting-list-ul BlockedContact">
                        <div className="EmptyBlockedContact">
                           <i><Noblocked /></i>
                           <p>No Blocked Contacts Found</p>
                        </div>
                     </div>
                  }
               </div>
            </div>
         </div>
      );
   }
}

const mapStateToProps = (state, props) => {
   return {
      blockedContact: state.blockedContact,
      rosterData: state.rosterData,
      groupsData: state.groupsData
   }
}

export default connect(mapStateToProps, null)(BlockedContacts);
