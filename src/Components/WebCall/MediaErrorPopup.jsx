import React, { Component } from "react";
import { connect } from "react-redux";
import { resetCallIntermediateScreen } from "../../Actions/CallAction";
import { hideModal } from "../../Actions/PopUp";
import Store from "../../Store";

class MediaErrorPopup extends Component {
  handleClosePopup = () => {
    const {
      popUpData: {
        modalProps: { statusCode, action = "" }
      }
    } = this.props;
    if ((statusCode === 100608 || statusCode === 100606) && action === "subscribeCall") {
      Store.dispatch(resetCallIntermediateScreen());
    }
    this.props.closePopup();
  };

  render() {
    const {
      popUpData: {
        modalProps: { statusCode, action = "" }
      }
    } = this.props;

    let content = "";
    if (statusCode === 100608) {
      content = "Camera and Microphone access required to continue video call, please enable and try again!";
    } else if (statusCode === 100606) {
      content = "Microphone access required to continue the audio call, please enable and try again!";
    } else if (statusCode === 100607) {
      content = "Camera access required to share the video, please enable and try again!";
    } else {
      content = "Seems like you have a problem with your microphone, please check and try again!";
    }

    let showOkButton = false;
    if (statusCode === 100607 && action === "subscribeCall") {
      showOkButton = true;
    }

    return (
      <div className="popup-wrapper action-permission">
        <div className="popup-container">
          <div className="popup-container-inner">
            <div className="popup-container-header"></div>
            <div className="popup-body">
              <div className="popup-label">
                <div className="label">{content}</div>
              </div>
            </div>
            <div className="popup-noteinfo">
              <button onClick={this.handleClosePopup} type="button" className="btn-cancel">
                Close
              </button>
              {showOkButton && (
                <button onClick={this.props.closePopup} type="button" className="btn-ok">
                  Ok
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    popUpData: state.popUpData
  };
};
const mapDispatchToProps = {
  closePopup: hideModal
};

export default connect(mapStateToProps, mapDispatchToProps)(MediaErrorPopup);
