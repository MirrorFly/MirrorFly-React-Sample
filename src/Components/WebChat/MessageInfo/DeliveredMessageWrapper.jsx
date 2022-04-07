import React, { Fragment } from 'react';
import Members from './Members';
import { uniqBy as _uniqBy } from "lodash"
import { CloseMessageInfoDetails, EmptyDeliver, OpenMessageInfoDetails } from '../../../assets/images';

const DeliveredMessageWrapper = (props = {}) => {
    const { deliveredMembers = [], totalMembers = 0, rosterData } = props;
    const deliveredMemberList = _uniqBy(deliveredMembers, "userId");
    return (
        <Fragment>
            <div className="deliveredDetailsContainer">
                <input type="checkbox" id="deliveredDetails" />
                <label htmlFor="deliveredDetails">
                    <i className="OpenMessageInfoDetails"><OpenMessageInfoDetails /></i>
                    <i className="CloseMessageInfoDetails"><CloseMessageInfoDetails /></i>
                    {`Delivered to ${deliveredMemberList.length} of ${totalMembers}`}</label>
                {deliveredMemberList.length === 0 &&
                    <div className="emptyDelivered">
                        <i><EmptyDeliver /></i>
                        <span>No message delivered yet!</span>
                    </div>}
                {deliveredMemberList.length > 0 &&
                    <div>
                        <ul className="chat-list-ul">
                            {
                                deliveredMemberList.map(member => {
                                    const { userId, deliveredTime } = member
                                    return <Members time={deliveredTime} rosterData={rosterData} key={userId} jid={userId} />
                                })
                            }
                        </ul>
                    </div>}
            </div>
        </Fragment>
    );
}

export default DeliveredMessageWrapper;
