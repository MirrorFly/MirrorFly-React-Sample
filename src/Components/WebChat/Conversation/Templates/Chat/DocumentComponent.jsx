import React from "react";
import { useSelector } from "react-redux";
import ProgressLoader from "../../ProgressLoader";
import getFileFromType from "../Common/getFileFromType";
import { DocumentDownload } from "../../../../../assets/images";
import { formatBytes } from "../../../../../Helpers/Chat/ChatHelper";
import { getExtension } from "../../../Common/FileUploadValidation";

const DocumentComponent = (props = {}) => {
  const { messageObject = {}, uploadStatus = 0, isSender, downloadAction } = props;
  const {
    msgId = "",
    msgBody: { media: { fileName, file_size, file_url, file_key } = {} } = {}
  } = messageObject;

  const {mediaDownloadData} = useSelector((state) => state);
  const fileExtension = getExtension(fileName);
  const placeholder = getFileFromType(null, fileExtension);
  const fileSize = formatBytes(file_size);
  const Extension = fileExtension.split(".").join("");

  return (
    <>
      <div
        className={`document-message-block ${uploadStatus !== 2 || 
          (msgId === mediaDownloadData?.downloadingStatus[msgId]?.downloadMediaMsgId && mediaDownloadData?.downloadingStatus[msgId]?.downloading === true) ? "fileProgress" : ""} 
          ${Extension === "pdf" || Extension === "ppt" ? "fileThumb" : ""}`}
      >
        <>
          <i className="doc">
            <img alt="file" src={placeholder} />
          </i>
          <span className="doc_name">
            <span>{fileName}</span>
          </span>
          <i className="doc-download" onClick={(e) => downloadAction(e, file_url, fileName, file_key, msgId)}>
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
