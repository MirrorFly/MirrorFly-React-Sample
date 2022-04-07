import React from 'react';
import {Banner,LoginInfo} from '../../assets/images';

/**
 * To display the instructios for pairing your phone with the MirrorFly on desktop.
 * @param {*} props
 */
function InstructionComponent(props) {
    return <div className="left-side">
        <img className="banner" src={Banner} alt=""></img>
        <div className="login-instructions">
            <h2>Scan with MirrorFly app to Login</h2>
            <ul>
                <li>1. Open MirrorFly on your phone.</li>
                <li>2. Tap <span>Menu</span> <i><LoginInfo /></i> or <span className="ios-icon">+</span> and select <span>Web.</span></li>
                <li>3. Scan the QR Code and get Logged in.</li>
            </ul>
        </div>
    </div>
}

export default InstructionComponent;
