import React from "react";
import Store from "../../../Store";
import { useSelector } from "react-redux";
import SendingFailed from "./SendingFailed";
import { DocumentDownload, DocumentDownloadDark, FileLoaderCircle, Upload3 } from "../../../../src/assets/images";
import { getActiveConversationChatId, getDownloadFileName, uploadFileFailure, uploadFileSuccess } from "../../../Helpers/Chat/ChatHelper";
import { CancelMediaDownload, CancelMediaUpload, RetryMediaUpload } from "../../../Actions/ChatHistory";
import SDK from "../../SDK";
import { DownloadingChatMedia, MediaDownloadDataAction } from "../../../Actions/Media";

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
// 10 - Resuming file upload
// 11 - Resuming file upload in queue

function ProgressLoader(props = {}) {
  const {
    msgId = "",
    file_url = "",
    isSender = true,
    uploadStatus = 0,
    imgFileDownloadOnclick,//click
    messageType,
    downloadEnabled
  } = props;

  const globalStore = useSelector((state) => state);
  const {
    appOnlineStatus: { isOnline = true } = {},
    mediaUploadData: { data = {} } = {},
    mediaDownloadingData,
    mediaDownloadData,
    
  } = globalStore || {};

  const getAnimateClass = () => ((data[msgId]?.progress === 100 || uploadStatus === 0 || uploadStatus === 1 || uploadStatus === 11)? "progress-animate" : "");
  const getDownloadAnimateClass = () => (mediaDownloadingData?.downloadingData[msgId]?.progress > 0 && uploadStatus !== 11) ? "progress-animate active-progress" : "";
  const getActiveProgressClass = () => (uploadStatus === 1 && data[msgId]?.progress ? "active-progress" : "");


  const cancelMediaUploadDownload = async () => {
    try {
      if (uploadStatus === 8) return true;
      if (data[msgId] && !mediaDownloadData?.downloadingStatus[msgId]?.downloading) {
        const canceledres = await SDK.cancelMediaUpload(msgId);
        if (canceledres?.statusCode == 200 && (uploadStatus === 0 || uploadStatus === 1 || uploadStatus === 11)) {
          const cancelObj = {
            msgId,
            fromUserId: getActiveConversationChatId(),
            uploadStatus: 7,
            mediaUploading: true,
            mediaUploadCanceled: true
          };
          Store.dispatch(CancelMediaUpload(cancelObj));
        }
      }
      else if (mediaDownloadingData?.downloadingData[msgId]?.msgId === msgId) {
       if(mediaDownloadingData?.downloadingData[msgId]?.uploadStatus !== 9){
        const downloadCanceRes = SDK.cancelMediaDownload(msgId)
        if (downloadCanceRes.statusCode === 200) {
          const cancelDownloadingObj = {
            msgId,
            uploadStatus: 9
          };
          Store.dispatch(CancelMediaDownload(cancelDownloadingObj));
        }
       }
       else{
          await SDK.downloadMedia(msgId, (res) => {
              const resumeDownloadingObj = {
                msgId,
                uploadStatus: 1
              };
              Store.dispatch(MediaDownloadDataAction(resumeDownloadingObj));
          }, 
          (mediaResponse) => {
                const {downloadingFile, downloadingMediaType}  = mediaDownloadData?.downloadingStatus[msgId];
                const fileName = downloadingMediaType === "file" ? downloadingFile : getDownloadFileName(downloadingFile, downloadingMediaType);
                let fileUrl = mediaResponse.blobUrl;
                const anchor = document.createElement("a");
                anchor.style.display = "none";
                anchor.href = fileUrl;
                anchor.setAttribute("download", fileName);
                document.body.appendChild(anchor);
                anchor.click();
                window.URL.revokeObjectURL(anchor.href);
                document.body.removeChild(anchor);
                Store.dispatch(Store.dispatch(DownloadingChatMedia({ downloadMediaMsgId: msgId, downloading: false })));
          }, 
          (error) => {
              console.log("error in downloading media file", error);
          });  
       }
      }
      else {
        const cancelObj = {
          msgId,
          fromUserId: getActiveConversationChatId(),
          uploadStatus: 3,
          mediaUploading: true,
          mediaUploadCanceled: true
        };
        Store.dispatch(CancelMediaUpload(cancelObj));
      }

      return false;
    } catch (error) {
      console.error("Error in cancelMediaUploadDownload:", error);
    }
  };

  const retryMediaUpload = async () => {
    try {
      if (data[msgId] && data[msgId].mediaUploadCanceled) {
       if (data[msgId].mediaUploading) {
          if (msgId) {
            const retryObj = {
              msgId,
              fromUserId: getActiveConversationChatId(),
              uploadStatus: 11
            };
            Store.dispatch(RetryMediaUpload(retryObj));
          }
          SDK.resumeMediaUpload(msgId, () => {
              if(data[msgId]){
                const resumeDatalObj = {
                  msgId,
                  fromUserId: getActiveConversationChatId(),
                  uploadStatus: 10,
                  mediaUploadCanceled: false
                };
                Store.dispatch(CancelMediaUpload(resumeDatalObj));
              }
            }, (response) => {
              uploadFileSuccess(msgId, getActiveConversationChatId(), response);
            }, (error) => {
              uploadFileFailure(msgId, getActiveConversationChatId());
            }
          );
        }
      }
      return false;
    } catch (error) {
      console.error("Error in cancelMediaUpload:", error);
      // Handle the error as needed
    }
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
        <Upload3 id={file_url} />
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
        {isOnline && (uploadStatus === 1 || uploadStatus === 0 || uploadStatus === 8 || uploadStatus === 9 || uploadStatus === 11) ? (
          <>
            <div data-jest-id={"jestcancelMediaUpload"} className="fileInprogess" onClick={((messageType == "image" || messageType == "audio") && !downloadEnabled && isSender) || (messageType == "audio" && !isSender && !data[msgId]) ? null : cancelMediaUploadDownload}>
              <FileLoaderCircle />
            </div>
            <div className="loadingProgress" style={((messageType == "image" || messageType == "audio") && !downloadEnabled && isSender) || (messageType == "audio" && !isSender && !data[msgId])  ? { cursor: "auto" } : { cursor: "pointer" }} onClick={((messageType == "image" || messageType == "audio") && !downloadEnabled && isSender) || (messageType == "audio" && !isSender && !data[msgId]) ? null : cancelMediaUploadDownload}>
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
            <div className="loadingProgress" onClick={(messageType == "image" || messageType == "audio") && !downloadEnabled ? null : cancelMediaUploadDownload}>
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

        {(uploadStatus === 3 || (uploadStatus === 4 && data[msgId]?.mediaUploadCanceled)) && commonRetryAction()}
        {uploadStatus === 4 && isOnline ? progressViewdiffer() : null}

        {uploadStatus === 5 && (
          <div className="reLoadFile failed">
            <span className="failed-text">File doesn't exists</span>
          </div>
        )}

        {(uploadStatus === 6 || ((uploadStatus === 4 || uploadStatus === 1 || uploadStatus === 11 || uploadStatus === 0) && !isOnline)) &&
          commonRetryAction()}
      </div>

      {(uploadStatus === 3 || ((uploadStatus === 1 || uploadStatus === 11 || uploadStatus === 0) && !isOnline) || (uploadStatus === 4 && data[msgId]?.mediaUploadCanceled)) && <SendingFailed />}
    </React.Fragment>
  );
}

export default ProgressLoader;
