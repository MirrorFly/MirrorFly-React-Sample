import React from 'react';
import { Link } from 'react-router-dom';
import { REACT_APP_SITE_DOMAIN } from '../processENV';
import '../../assets/scss/common.scss';

/**
 * To display the instructios for pairing your phone with the MirrorFly on desktop.
 */
class HelpComponent extends React.Component {
    render() {
        return (
            <>
                <div className="help-container">
                    <h4>Pairing your phone with the MirrorFly on desktop</h4>
                    <div>
                        <ol>
                            <li>1. Open MirrorFly on your computer or visit <Link to="/">{REACT_APP_SITE_DOMAIN}</Link> on your computer. (Make sure it is the official client or website)
                            </li>
                            <li>2. When prompted with a QR code, use the QR scanner within MirrorFly to scan the QR code.
                                <ul>
                                    <li>On Mobile: in the Chats screen > Menu > Web.</li>
                                </ul>
                            </li>
                            <li>3. To do so, open MirrorFly on your phone.</li>
                            <li>4. Scan the QR Code on your computer screen from your phone.</li>
                        </ol>
                        <p>
                            If you believe someone has scanned your QR code and has access to your account via MirrorFly Web,
                            use the instruction above to log out of all your active web sessions in MirrorFly on your mobile phone.
                        </p>
                        <p>
                            Note: If you are unable to scan the QR code, ensure that the main camera on your phone is functioning properly.
                            If the camera is not able to auto-focus, blurry or is broken, you may not be able to scan the barcode. Currently, there is no other way of logging into MirrorFly on your desktop.
                        </p>
                        <Link to="/">Home</Link>
                    </div>
                </div>
            </>
        )
    }
}

export default HelpComponent;
