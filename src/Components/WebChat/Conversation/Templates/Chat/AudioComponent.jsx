import React, { useEffect, useState } from "react";
import ProgressLoader from "../../ProgressLoader";
import AudioPlayer from "react-h5-audio-player";
import { ChatAudioRecorder, ChatAudioSender2 } from "../../../../../assets/images";
import "../../../../../assets/scss/audioplayer.scss";
import "react-h5-audio-player/lib/styles.css";
import { isBlobUrl } from "../../../../../Helpers/Utility";
import { useSelector } from "react-redux";

const AudioComponent = (props = {}) => {
  const { messageObject = {}, uploadStatus, isSender, audioFileDownloadOnclick, mediaUrl = ""} = props;
  const { msgId = "", msgBody: { media: { file_url = "", audioType = "" } = {} } = {} } = messageObject;
  const {mediaDownloadData, mediaDownloadingData} = useSelector((state) => state) || {};

  const [isPlaying, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(mediaUrl);


  // const getAudio = async () => {
  //   const audioBlobUrl = await getBlobUrlFromToken(file_url, getDbInstanceName("audio"), file_key);
  //   setAudioUrl(audioBlobUrl);
  // };

  useEffect(() => {
    if (mediaUrl !== "") return setAudioUrl(mediaUrl);
    if (isBlobUrl(file_url)) return setAudioUrl(mediaUrl);
    // if (mediaUrl === "" && audioUrl === "") getAudio();
  }, [mediaUrl, msgId]);

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
          uploadStatus={audioUrl === "" ? 1 : uploadStatus}
        />
        <AudioPlayer
          src={uploadStatus === 1 ? "" : audioUrl}
          autoPlay={false}
          autoPlayAfterSrcChange={false}
          showLoopControl={false}
          showSkipControls={false}
          showJumpControls={false}
          showVolumeControl={false}
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
