import React from "react";
import { IconBackArrow, Sarah1, } from '../../../assets/images';
const ShowMediaInDetailPopup = () => {
    return (
        <div className="MediaInDetails">
            <div className="contactinfo-header">
                <i className="backtoInfo" >
                    <IconBackArrow />
                </i>
                <ul className="tabs">
                    <li className="active">Media</li>
                    <li>Docs</li>
                    <li>Links</li>
                </ul>
            </div>
            <div className="MediaDetails">
                <div className="MediaImage">
                    <ul>
                        <li className="img">
                            <img src={Sarah1} alt="alt-img" />
                        </li>
                        <li className="img">
                            <img src={Sarah1} alt="alt-img" />
                        </li>
                        <li className="video">
                            <img src={Sarah1} alt="alt-img" />
                        </li>
                    </ul>
                </div>
                {/* <div className='noMedia'>
                                            {"No Docs Found…!!!"}
                                            {"No Docs Links…!!!"}
                                            </div> */}
            </div>
        </div>
    )
}
export default ShowMediaInDetailPopup;
