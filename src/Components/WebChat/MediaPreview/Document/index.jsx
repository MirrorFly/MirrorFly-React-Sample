import React, { Component, Fragment } from "react";
import { formatBytes } from "../../../../Helpers/Chat/ChatHelper";

export default class PreviewDocument extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.updateMedia(this.props.media, {
      msgType: "file"
    });
  }

  render() {
    const {
      media: { name = "", size = "" } = {},
      placeholder
    } = this.props;
    const updateSize = formatBytes(size);

    return (
      <Fragment>
        <div className="type-image document">
          <div className="type-thumb-image">
            <img src={placeholder} alt="" />
            <p>{`${name} , ${updateSize}`}</p>
          </div>
        </div>
      </Fragment>
    );
  }
}
