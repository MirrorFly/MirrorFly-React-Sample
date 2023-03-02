import React from 'react';
import "./MentionUserList.scss";
import ImageComponent from '../../../../Common/ImageComponent';
import { getUserDetails } from '../../../../../../Helpers/Chat/User';

function MentionUserList(props = {}) {

    const { GroupParticiapantsList = {}, handleMentionedData = () => { } } = props;

    return (
        <div className='mention_wraper'>
            <ul>
                {GroupParticiapantsList.map((obj) => {
                    let rosterData = getUserDetails(obj.userId);
                    let displayName = rosterData.displayName;
                    return (
                        <li key={obj.userId}>
                            <button onClick={() => handleMentionedData(obj.userId)} className='user_card_action' type='button'>
                                <div className='user_card'>
                                    <div className='user_image'>
                                        <ImageComponent chatType={"chat"} imageToken={rosterData.image} name={displayName} />
                                    </div>
                                    <div className='user_name'>{displayName}</div>
                                </div>
                            </button>
                        </li>
                    )
                })}

            </ul>
        </div>
    );
}

export default MentionUserList;
