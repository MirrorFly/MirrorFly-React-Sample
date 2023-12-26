import React, { useEffect, useState } from "react";
import ProgressLoader from "../../ProgressLoader";
import AudioPlayer from "react-h5-audio-player";
import { ChatAudioRecorder, ChatAudioSender2 } from "../../../../../assets/images";
import "../../../../../assets/scss/audioplayer.scss";
import "react-h5-audio-player/lib/styles.css";
import { getDbInstanceName, isBlobUrl } from "../../../../../Helpers/Utility";
import { useSelector } from "react-redux";
import { getBlobUrlFromToken } from "../../../../../Helpers/Chat/ChatHelper";

const AudioComponent = (props = {}) => {
  const { messageObject = {}, uploadStatus, isSender, audioFileDownloadOnclick, mediaUrl = "", audioUrlDownloaded} = props;
  const { msgId = "", msgBody: { media: { file_url = "", audioType = "", file_key } = {} } = {} } = messageObject;
  const {mediaDownloadData, mediaDownloadingData} = useSelector((state) => state) || {};

  const [isPlaying, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(mediaUrl);

  const getAudio = async () => {
   const audioBlobUrl = await getBlobUrlFromToken(file_url, getDbInstanceName("audio"), file_key, msgId);
   setAudioUrl(audioBlobUrl);
  };

  useEffect(() => {
    if (mediaUrl !== "") return setAudioUrl(mediaUrl);
    if (isBlobUrl(file_url)) return setAudioUrl(mediaUrl);
    if (mediaUrl === "" && audioUrl === "" && uploadStatus === 2) getAudio();
  }, [mediaUrl, msgId, uploadStatus]);

  useEffect(() => {
    if (audioUrl.search("blob:") !== -1 && uploadStatus ===2) {
      setAudioUrl((prevAudioUrl) => {
        audioUrlDownloaded && audioUrlDownloaded(prevAudioUrl);
        return prevAudioUrl;
      });
    }
  }, [audioUrl]);

  const handleOnPlayEnd = (e) => {
    e.target.play();
    setTimeout(() => e.target.pause(), 10);
  };

  const handleOnPlay = (e = {}) => {
    setTimeout(() => setPlaying(true), 0);
    document &&
      document
        .querySelectorAll("audio")
        .forEach((element) => (element.src !== e.srcElement.currentSrc ? element.pause() : element.play()));
  };

  return (
    <>
      <div
        className={`audio-message-container
            ${
              uploadStatus !== 2 ||
              audioUrl === "" ||
              (msgId === mediaDownloadData?.downloadingStatus[msgId]?.downloadMediaMsgId &&
                mediaDownloadData?.downloadingStatus[msgId]?.downloading === true) ||
              (msgId === mediaDownloadingData?.downloadingData[msgId]?.msgId &&
                mediaDownloadingData?.downloadingData[msgId]?.uploadStatus === 9)
                ? "fileProgress"
                : ""
            }
            ${isPlaying ? "isPlaying" : ""}`}
      >
        {audioType !== "recording" ? (
          <i className="audio">
            <ChatAudioSender2 />
          </i>
        ) : (
          <i className="audio recording">{<ChatAudioRecorder />}</i>
        )}

        <ProgressLoader
          msgId={msgId}
          isSender={isSender}
          file_url={file_url}
          imgFileDownloadOnclick={audioFileDownloadOnclick}
          uploadStatus={((uploadStatus === 2 && audioUrl === "") || uploadStatus === 4) ? 1 : uploadStatus}
          messageType = "audio"
          downloadEnabled = {audioUrl !== "" ? true : false}
        />
        <AudioPlayer
          src={audioUrl}
          autoPlay={false}
          autoPlayAfterSrcChange={false}
          showLoopControl={false}
          showSkipControls={false}
          showJumpControls={false}
          showVolumeControl={false}
          customVolumeControls={[]}
          customAdditionalControls={[]}
          loop={false}
          onPlayError={(e) => console.log("handleOnPlayError", e)}
          onEnded={(e) => handleOnPlayEnd(e)}
          onPause={() => setPlaying(false)}
          onPlay={(e) => handleOnPlay(e)}
          onSeeking={(e) => handleOnPlay(e)}
        />
      </div>
      <div className="image-caption">
        <span></span>
      </div>
    </>
  );
};

export default AudioComponent;
