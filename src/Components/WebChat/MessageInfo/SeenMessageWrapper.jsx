import React, { Fragment } from 'react';
import { CloseMessageInfoDetails, EmptyDeliver, OpenMessageInfoDetails } from '../../../assets/images';
import Members from './Members';

const SeenMessageWrapper = (props = {}) => {
    const { seenMembers = [], totalMembers = 0, rosterData = {} } = props;
    
    return (
        <Fragment>
            <div className="readByDetailsContainer">
                <input type="checkbox" id="readByDetails" />
                <label htmlFor="readByDetails">
                    <i className="OpenMessageInfoDetails"><OpenMessageInfoDetails /></i>
                    <i className="CloseMessageInfoDetails"><CloseMessageInfoDetails /></i>
                    {`Read by ${seenMembers.length} of ${totalMembers}`}</label>
                {seenMembers.length === 0 && <div className="emptyDelivered">
                    <i><EmptyDeliver /></i>
                    <span>No one is read yet!</span>
                </div>}
                {seenMembers.length > 0 && <div>
                    <ul className="chat-list-ul">
                        {
                            seenMembers.map(member => {
                                const { userId, seenTime } = member
                                return <Members
                                    time={seenTime}
                                    rosterData={rosterData}
                                    key={userId} jid={userId} />
                            })
                        }
                    </ul>
                </div>}

            </div>
        </Fragment>
    );
}

export default SeenMessageWrapper;
