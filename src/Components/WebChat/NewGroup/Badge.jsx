import React, { Fragment } from "react";
import { getContactNameFromRoster } from "../../../Helpers/Chat/User";
export default function Badge(props) {

    const { userId, removeParticipant,isBlocked } = props
    const nameToDisplay = getContactNameFromRoster(props);
    return (
        <Fragment>
            {!isBlocked &&
            <li>
                <div>
                    <span className="badgeImg"><img src='/static/media/sample-profile.dad49187.svg' alt="" /></span>
                    <span title={nameToDisplay} className="badgeTitle">{nameToDisplay}</span>
                    <i onClick={ ()=>removeParticipant(userId) } className="badgeAction">X</i>
                </div>
            </li>
            }
        </Fragment>
    )
}
