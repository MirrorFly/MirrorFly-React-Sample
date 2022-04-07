import React from "react";
import ProgressLoader from "../../ProgressLoader";
import getFileFromType from "../Common/getFileFromType";
import { DocumentDownload } from "../../../../../assets/images";
import { formatBytes } from "../../../../../Helpers/Chat/ChatHelper";
import { getExtension } from "../../../Common/FileUploadValidation";

const DocumentComponent = (props = {}) => {
  const { messageObject = {}, uploadStatus = 0, isSender, downloadAction } = props;
  const {
    msgId = "",
    msgBody: { media: { fileName, file_size, file_url } = {} } = {}
  } = messageObject;

  const fileExtension = getExtension(fileName);
  const placeholder = getFileFromType(null, fileExtension);
  const fileSize = formatBytes(file_size);
  const Extension = fileExtension.split(".").join("");

  return (
    <>
      <div
        className={`document-message-block ${uploadStatus !== 2 ? "fileProgress" : ""} ${Extension === "pdf" || Extension === "ppt" ? "fileThumb" : ""
          }`}
        onClick={(e) => downloadAction(e, file_url, fileName)}
      >
        <>
          <i className="doc">
            <img alt="file" src={placeholder} />
          </i>
          <span className="doc_name">
            <span>{fileName}</span>
          </span>
          <i className="doc-download">
            <DocumentDownload />
          </i>
          <ProgressLoader
            msgId={msgId}
            isSender={isSender}
            uploadStatus={uploadStatus}
            imgFileDownloadOnclick={() => {
              console.log("document download ready");
            }}
          />
        </>
      </div>
      <span className="file-details">{fileSize}</span>
    </>
  );
};

export default DocumentComponent;
