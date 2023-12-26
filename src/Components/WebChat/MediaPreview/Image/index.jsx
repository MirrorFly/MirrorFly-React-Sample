import React, { Component } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, ZoomRestore } from "../../../../assets/images";
import Caption from "../Caption";
import { connect } from "react-redux";
import { getThumbBase64URL } from "../../../../Helpers/Utility";

class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSrc: URL.createObjectURL(props.media),
      imageThumbsrc:null,
    };
  }

  componentDidMount() {
    this.props.updateMedia(this.props.media, {
      imageUrl: this.state.imgSrc,
      msgType: "image"
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.mediaImageThumbData && prevProps.mediaImageThumbData !== this.props.mediaImageThumbData) {
      const thumbImageData = this.props.mediaImageThumbData[this.props.uniqueId]?.thumbImage;
      if(thumbImageData){
       const thumbImageurl = getThumbBase64URL(thumbImageData);
        this.setState({
          imageThumbsrc:thumbImageurl
        })
      }
    }
    
  }

  render() {
    return (
      <div className="type-image" id="preview">
        <div className={`imageZoomWrapper`}>
          <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <React.Fragment>
                <div className="tools zoomTools">
                  <button onClick={zoomIn}>
                    <ZoomIn />
                  </button>
                  <button onClick={zoomOut}>
                    <ZoomOut />
                  </button>
                  <button onClick={resetTransform}>
                    <ZoomRestore />
                  </button>
                </div>
                <TransformComponent>
                  <img className="sliderImage" src={this.state.imageThumbsrc || ''} alt="" />
                </TransformComponent>
              </React.Fragment>
            )}
          </TransformWrapper>
        </div>
        <Caption
          onChangeCaption={this.props.onChangeCaption}
          media={this.props.media}
          uniqueId={this.props.uniqueId}
          selectedFiles={this.props.selectedFiles}
          onClickSend={this.props.onClickSend}
          chatType={this.props.chatType}
          chatId={this.props.chatId}
          newFile={this.props.type}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mediaImageThumbData: state.mediaImageThumbData,
  };
};

export default connect(mapStateToProps, {})(Image);
