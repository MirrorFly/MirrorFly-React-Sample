import React, { } from 'react';
import { FloatingCallAction, FloatingCallVideo, FloatingCallAudio } from '../../../../assets/images';
import './FloatingCallOption.scss';

const FloatingCallOption = (props={}) => {
   const {handleAudioCall, handleVideoCall} = props;
    return (
        <label className="FloatingCallAction" htmlFor="FloatingAction">
            <input id="FloatingAction" type="checkbox"/>
            <span>
            <FloatingCallAction/>
            </span>
            <ul>
                <li title="Video call" onClick={handleVideoCall ? handleVideoCall : null} >
                    <i>
                       <FloatingCallVideo/>
                    </i>
                </li>
                <li title="Audio call" onClick={handleAudioCall ? handleAudioCall : null}>
                    <i>
                    <FloatingCallAudio/>
                    </i>
                </li>
            </ul>
        </label>
    );
}

export default FloatingCallOption;
