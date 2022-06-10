import MicRecorder from "mic-recorder-to-mp3";
import React, { Fragment, useMemo, useRef, useState } from "react";
import { RecordAudio, StartRecord, StopRecord, AudioPermissionIcon } from "../../../assets/images";
import "./AudioRecorder.scss";
import { AUDIO_PERMISSION_DENIED, PERMISSION_DENIED } from "../../processENV";
import Modal from "./Modal";
import { blockOfflineMsgAction } from "../../../Helpers/Utility";
import { toast } from "react-toastify";

function getBlobDuration(blob) {
  const tempVideoEl = document.createElement("video");
  const durationP = new Promise((resolve) =>
    tempVideoEl.addEventListener("loadedmetadata", () => {
      resolve(Math.round(tempVideoEl.duration * 1000));
    })
  );
  tempVideoEl.src = typeof blob === "string" || blob instanceof String ? blob : window.URL.createObjectURL(blob);

  return durationP;
}

const AudioRecorder = (props = {}) => {
  const recorder = useMemo(() => new MicRecorder({ bitRate: 128 }), []);
  const [recordStatus, setRecordStatus] = useState(true);
  const [micStatus, setMicStatus] = useState(false);
  const [sendStatus, setSendStatus] = useState(false);
  const audioTimer = useRef(null);
  const { recordingStatus } = props;

  const stopRecored = () => {
    recorder.stop();
    clearTimeout(audioTimer.current);
    const container = document.getElementById("typingContainer");
    container && container.setAttribute("contentEditable", true);
    setRecordStatus(true);
    recordingStatus(true);
  };

  const autoStop = () => {
    recorder.stop();
    clearTimeout(audioTimer.current);
  };

  const sendRecored = () => {
    if (blockOfflineMsgAction()) return true;
    if (!sendStatus) return true;
    clearTimeout(audioTimer.current);
    setRecordStatus(true);
    recordingStatus(true);
    setSendStatus(false);
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "voice.mp3", {
          type: blob.type,
          lastModified: Date.now()
        });
        return getBlobDuration(blob).then(function (duration) {
          file.fileDetails = {
            duration: duration,
            audioType: "recording"
          };
          const container = document.getElementById("typingContainer");
          container && container.setAttribute("contentEditable", true);
          return props.handleSendMediaMsg([file]);

        });
      })
      .catch((e) => {
        console.log(e);
      })
    return sendStatus;
  };

  const startTimer = (duration, display) => {
    let start = Date.now(),
      diff,
      minutes,
      seconds;
    function timer() {
      diff = duration - (((Date.now() - start) / 1000) | 0);
      duration - 1 === diff && setSendStatus(true); // For Restricting to Send Less than 1 Second
      minutes = (diff / 60) | 0;
      seconds = diff % 60 | 0;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      if(seconds>=0)
      {
      display.innerHTML =
        '<span class="recordMinutes">' + minutes + '</span>:<span class="recordSeconds">' + seconds + "</span>";
      }
      if (diff < 0) {
        autoStop();
        return;
      }
    }
    timer();
    audioTimer.current = setInterval(timer, 1000);
  };

  const startRecored = () => {
    if (blockOfflineMsgAction()) return;
    if(props.avoidRecord){
      toast("Unable to record audio while on call.");
      return;
    }
    let settings = JSON.parse(localStorage.getItem("settings"));
    const { audioLimit = 300 } = settings || {};
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(function (permissionStatus) {
        if (permissionStatus.active) {
          setMicStatus(false);
          let sounds = document.getElementsByTagName("audio");
          for (let i = 0; i < sounds.length; i++) sounds[i].pause();
          recorder
            .start()
            .then(() => {
              setRecordStatus(false);
              recordingStatus(false);
              const container = document.getElementById("typingContainer");
              container && container.setAttribute("contentEditable", false);
              startTimer(audioLimit, document.getElementById("recordDuration"));
            })
            .catch((e) => {
              console.error(e);
            });
        } else {
          setMicStatus(true);
        }
      })
      .catch((err) => {
        setMicStatus(true);
      });
  };

  const _handleaudioPopup = (e) => {
    setMicStatus(false);
  };

  return (
    <Fragment>
      {!recordStatus && (
        <div className="recordAudio">
          <div className="recordAudioInner">
            <i title="Stop record" className="stopRecord">
              <StopRecord onClick={stopRecored} />
            </i>
            <span className="liveRecord"></span>
            <span id="recordDuration" className="recordDuration"></span>
            <i title="Send record" className="sendRecord">
              <StartRecord onClick={sendRecored} />
            </i>
          </div>
        </div>
      )}
      {recordStatus && (
        <div className="formbtns">
          <a type="" className="recordAudio" onClick={startRecored}>
            <i title="Record" className="recordAudioIcon">
              <RecordAudio />
            </i>
          </a>
        </div>
      )}
      {micStatus ? (
        <>

          <Modal containerId="container">
            <div className="camera-container mediaAttachCamera">
              <div className="camera-popup">
                <h4>{PERMISSION_DENIED}</h4>
                <i>
                  <AudioPermissionIcon />
                </i>
                <p>{AUDIO_PERMISSION_DENIED}</p>
                <div className="popup-controls">
                  <button
                    id={"jestBtnCancel"}
                    type="button"
                    name="btn-cancel"
                    className="btn-okay"
                    onClick={(e) => _handleaudioPopup(e)}
                  >
                    {"Okay"}
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </>
      ) : null}
    </Fragment>
  );
};

export default AudioRecorder;
