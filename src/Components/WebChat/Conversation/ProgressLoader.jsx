import React from "react";
import Store from "../../../Store";
import { useSelector } from "react-redux";
import SendingFailed from "./SendingFailed";
import { DocumentDownload, DocumentDownloadDark, FileLoaderCircle, Upload3 } from "../../../../src/assets/images";
import { getActiveConversationChatId } from "../../../Helpers/Chat/ChatHelper";
import { CancelMediaDownload, CancelMediaUpload, RetryMediaUpload } from "../../../Actions/ChatHistory";

// Upload Status
// 0 - Before Upload
// 1 - Uploading Loader - Sender
// 2 - Uploaded
// 3 - Upload Failed
// 4 - Download Loader - Receiver
// 5 - File Not Available
// 6 - Receiver Download Failed
// 7 - Sender - User Cancelled
// 8 - Forward Uploading
// 9 - User Cancelled Downloading

function ProgressLoader(props = {}) {
  const {
    msgId = "",
    file_url = "",
    isSender = true,
    uploadStatus = 0,
    imgFileDownloadOnclick,//click
  } = props;

  const globalStore = useSelector((state) => state);
  const {
    appOnlineStatus: { isOnline = true } = {},
    mediaUploadData: { data = {} } = {},
    mediaDownloadingData,
    mediaDownloadData,
    
  } = globalStore || {};

  const getAnimateClass = () => ((data[msgId]?.progress === 100 || uploadStatus === 0 || uploadStatus === 1)? "progress-animate" : "");
  const getDownloadAnimateClass = () => (mediaDownloadingData?.downloadingData[msgId]?.progress > 0) ? "progress-animate active-progress" : "";
  const getActiveProgressClass = () => (uploadStatus === 1 && data[msgId]?.progress < 100 ? "active-progress" : "");

  const cancelMediaUpload = () => {
    if (uploadStatus === 8) return true;

    if (data[msgId]) {
      data[msgId].source.cancel("User Cancelled!");
      if (uploadStatus === 0 || uploadStatus === 1) {
        const cancelObj = {
          msgId,
          fromUserId: getActiveConversationChatId(),
          uploadStatus: 7
        };
        Store.dispatch(CancelMediaUpload(cancelObj));
      }
    } else if (
      mediaDownloadingData?.downloadingData[msgId]?.msgId === msgId &&
      mediaDownloadingData?.downloadingData[msgId]?.uploadStatus !== 9
    ) {
      mediaDownloadingData.downloadingData[msgId].source.cancel("User Cancelled Downloading Item!")
      const cancelDownloadingObj = {
        msgId,
        uploadStatus: 9
      };
      Store.dispatch(CancelMediaDownload(cancelDownloadingObj));
    }
    return false;
  };

  const retryMediaUpload = () => {
    const retryObj = {
      msgId,
      fromUserId: getActiveConversationChatId(),
      uploadStatus: 1
    };
    Store.dispatch(RetryMediaUpload(retryObj));
  };

  const handleMediaClick = (e) => {
    if (isSender) {
      imgFileDownloadOnclick(e);
    } else {
      retryMediaUpload();
    }
  };

  const commonRetryAction = () => {
    return (
      <div
        id={file_url}
        className="reLoadFile"
        onClick={handleMediaClick}
        data-jest-id={"jesthandleMediaClick"}
      >
        <Upload3 id={file_url} onClick={handleMediaClick} />
        <span id={file_url} className="Retry">Retry</span>
      </div>
    );
  };

  const getSyncClass = () => (isSender ? "sync left" : "sync right");
  const progressView = () => {
    return (
  <div className={`loadingProgress ${getSyncClass()}`}>
  <Upload3 />
  <span className="progressBar progress-animate" style={{ width: "50%" }}></span>
</div>
    );
  };
  const progressViewdiffer=()=> {
    progressView();
  };



  return (
    <React.Fragment>
      <div className="progressOverlay">
        {isOnline && (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8 || uploadStatus === 9) ? (
          <>
            <div data-jest-id={"jestcancelMediaUpload"} className="fileInprogess" onClick={cancelMediaUpload}>
              <FileLoaderCircle />
            </div>
            <div className="loadingProgress" onClick={cancelMediaUpload}>
              <span
                className={`progressBar ${getDownloadAnimateClass()} ${getAnimateClass()} ${getActiveProgressClass()}`}
                style={{ width: `${data[msgId]?.progress}%` }}
              ></span>
            </div>
          </>
        ) : null}

        {(msgId === mediaDownloadData?.downloadingStatus[msgId]?.downloadMediaMsgId &&
          mediaDownloadData?.downloadingStatus[msgId]?.downloading === true) ||
        (msgId === mediaDownloadingData?.downloadingData[msgId]?.msgId &&
          mediaDownloadingData?.downloadingData[msgId]?.uploadStatus === 9) ? (
          <>
            <div className="fileInprogess">
              {(mediaDownloadData?.downloadingStatus[msgId]?.downloadingMediaType === "audio" ||
                mediaDownloadData?.downloadingStatus[msgId]?.downloadingMediaType === "file" ||
                mediaDownloadingData?.downloadingData[msgId]?.uploadStatus === 9) &&
              isSender === true ? (
                <DocumentDownloadDark />
              ) : (
                <DocumentDownload />
              )}
            </div>
            <div className="loadingProgress" onClick={cancelMediaUpload}>
              <span
                className={
                  mediaDownloadingData?.downloadingData[msgId]?.uploadStatus !== 9
                    ? "progressBar progress-animate active-progress"
                    : ""
                }
              ></span>
            </div>
          </>
        ) : null}

        {uploadStatus === 3 && commonRetryAction()}
        {uploadStatus === 4 && isOnline ? progressViewdiffer() : null}

        {uploadStatus === 5 && (
          <div className="reLoadFile failed">
            <span className="failed-text">File doesn't exists</span>
          </div>
        )}

        {(uploadStatus === 6 || ((uploadStatus === 4 || uploadStatus === 1 || uploadStatus === 0) && !isOnline)) &&
          commonRetryAction()}
      </div>

      {(uploadStatus === 3 || ((uploadStatus === 1 || uploadStatus === 0) && !isOnline)) && <SendingFailed />}
    </React.Fragment>
  );
}

export default ProgressLoader;
