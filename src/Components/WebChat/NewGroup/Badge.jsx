import React, { Fragment, useEffect, useState } from "react";
import { ImgUserPlaceholder } from "../../../assets/images";
import { getContactNameFromRoster } from "../../../Helpers/Chat/User";
import IndexedDb from "../../../Helpers/IndexedDb";
const indexedDb = new IndexedDb();
const avatarIcon = ImgUserPlaceholder;

export default function Badge(props) {
    const { userId, removeParticipant,isBlocked, image, thumbImage } = props
    const nameToDisplay = getContactNameFromRoster(props);
    const [getImage, saveImage] = useState(null);

    const checkNotFound = (event) => (event.target.src = avatarIcon);

    useEffect(() => {
        let fileImage = thumbImage !== "" ? thumbImage : image;
        indexedDb
        .getImageByKey(fileImage, "profileimages", "")
        .then((blob) => {
            let blobUrl = window.URL.createObjectURL(blob);
            saveImage(blobUrl);
        })
        .catch(() => {
        });
    },[image,thumbImage]);
    
    const updatedUrl = getImage ? getImage : avatarIcon;

    return (
        <Fragment>
            {!isBlocked &&
            <li>
                <div>
                    <span className="badgeImg">
                        <img src={updatedUrl} 
                        onError={checkNotFound}
                        alt = {""}
                         />
                        </span>
                    <span title={nameToDisplay} className="badgeTitle">{nameToDisplay}</span>
                    <i onClick={ ()=>removeParticipant(userId) } className="badgeAction">X</i>
                </div>
            </li>
            }
        </Fragment>
    )
}
