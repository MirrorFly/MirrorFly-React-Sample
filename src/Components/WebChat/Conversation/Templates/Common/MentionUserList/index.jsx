import React from 'react';
import "./MentionUserList.scss";
import ImageComponent from '../../../../Common/ImageComponent';
import { useEffect, useState } from 'react';

function MentionUserList(props = {}) {
    const { GroupParticiapantsList = [], handleMentionedData = () => { }, chatScreenName="" } = props;
    const[sortedGroupList, setSortedGroupList] = useState([]);

    useEffect(() => {
        GroupParticiapantsList.sort((b, c) => isNaN(parseInt(c.rosterData.displayName)) - isNaN(parseInt(b.rosterData.displayName)) || 
        String(b.rosterData.displayName).localeCompare(String(c.rosterData.displayName)))
        setSortedGroupList(GroupParticiapantsList)
      },[GroupParticiapantsList]);

    return (
        <div className='mention_wraper'>
            <ul>
                {sortedGroupList.map((obj) => {
                    let rosterData = obj.rosterData;
                    let displayName = rosterData.displayName !== "" ? rosterData.displayName : rosterData.userId;
                    return (
                         <li key={obj.userId}>
                            <button onClick={() =>obj.isAdminBlocked === false && handleMentionedData(obj.userId, chatScreenName, true)} className='user_card_action' type='button'>
                                <div className='user_card'>
                                    <div className='user_image'>
                                        <ImageComponent
                                         chatType={"chat"}
                                         imageToken={rosterData.thumbImage !== "" ? rosterData.thumbImage : rosterData.image}
                                         name={displayName} />
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
