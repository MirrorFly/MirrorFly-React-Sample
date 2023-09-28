import React, { Component } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, ZoomRestore } from "../../../../assets/images";
import Caption from "../Caption";

export default class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgSrc: URL.createObjectURL(props.media)
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.imgSrc === nextState.imgSrc && this.props.caption === nextProps.caption ? false : true;
  }

  componentDidMount() {
    this.props.updateMedia(this.props.media, {
      imageUrl: this.state.imgSrc,
      msgType: "image"
    });
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
                  <img className="sliderImage" src={this.state.imgSrc} alt="" />
                </TransformComponent>
              </React.Fragment>
            )}
          </TransformWrapper>
        </div>
        <Caption
          onChangeCaption={this.props.onChangeCaption}
          media={this.props.media}
          uniqueId={this.props.uniqueId}
          onClickSend={this.props.onClickSend}
          chatType={this.props.chatType}
          chatId={this.props.chatId}
          newFile={this.props.type}
        />
      </div>
    );
  }
}
