import React from "react";
import Camera, { IMAGE_TYPES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import { loaderSVG } from '../../../assets/images';
import { dataURLtoFile } from "../../../Helpers/Utility";

class WebChatCamera extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraLoader: false,
      onCameraError: false
    }
  }

  /**
  * handleTakePhoto() to capture the photo and send image to parent component.
  */
  handleTakePhoto(dataUri) {
    // If dataUri is empty, block the further process
    if (!dataUri || dataUri === 'data:' || dataUri === 'data:,') return;
    this.stopCameraStream()
    const file = dataURLtoFile(dataUri, 'image.png');
    this.props.sendFile(file);
  }

  /**
  * onCameraError() to find whether device is active.
  */
  onCameraError(error) {
    this.props.onCameraCheck(error);
  }

  stopCameraStream = () => {
    const videoElement = document.querySelector('.react-html5-camera-photo > video');
    if (!videoElement || !videoElement.srcObject) return;
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
  }

  componentWillUnmount() {
    this.stopCameraStream()
  }

  /**
   * render() method to render the WebChatCamera Component into browser.
   */
  render() {
    const loaderStyle = {
      width: 40,
      height: 40,
      marginTop: -10
    }
    return (
      <>
        {this.state.cameraLoader &&
          <div className="loader">
            <img src={loaderSVG} alt="loader" style={loaderStyle} />
          </div>
        }
        <Camera
          // idealResolution={{ width: 1200, height: 900 }}
          imageType={IMAGE_TYPES.JPG}
          isImageMirror={true}
          isSilentMode={true}
          sizeFactor={1}
          onCameraError={(error) => {
            this.onCameraError(error);
          }}
          onTakePhoto={(dataUri) => {
            this.handleTakePhoto(dataUri);
          }}
          isDisplayStartCameraError={true}
        />
      </>
    );
  }
}

export default WebChatCamera;
