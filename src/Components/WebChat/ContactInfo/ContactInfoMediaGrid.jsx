import React from "react";
import {
    GoBack, mediaAudio, mediaFile, mediaimg1, mediaimg2, mediaimg3, mediaVideo,
} from '../../../assets/images';
const ContactInfoMediaGrid = (props = {}) => {
    const {
        handleContactMedia = () => { }
    } = props;
    return (
        <div className="mediainfo-popup">
            <div className="mediainfo">
                <div className="mediainfo-header">
                    <i onClick={handleContactMedia}>
                        <GoBack />
                    </i>
                    <h4>Media &amp; docs</h4>
                </div>
                <div className="mediainfo-media">
                    <ul className="mediadocs">
                        <li><img src={mediaimg1} alt="" /></li>
                        <li className="media-video">
                            <img src={mediaimg2} alt="" />
                            <div className="overlay">
                                <img src={mediaVideo}
                                    className="video-icon" alt=""
                                />
                            </div>
                        </li>
                        <li><img src={mediaimg3} alt="" /></li>
                        <li className="media-audio">
                            <span className="media-inner">
                                <span className="media-text">
                                    03:24
                                </span>
                                <img src={mediaAudio} alt="" />
                            </span>
                        </li>
                        <li className="media-file">
                            <span className="media-inner">
                                <span className="media-text">
                                    Short-stories.txt
                                </span>
                                <img src={mediaFile} alt="" />
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default ContactInfoMediaGrid;
