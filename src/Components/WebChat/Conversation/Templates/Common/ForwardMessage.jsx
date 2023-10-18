import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { messageForwardAdd, messageForwardRemove } from "../../../../../Actions/MessageActions";

export default function ForwardMessage(props) {
  const { msgid, timestamp, forward, forwardMessageId, favouriteStatus, selectedToForward = () => {} } = props;
  const {
    selectedMessageData: { data = [] } = {}
  } = useSelector((state) => state);
  const [isChecked, setChecked] = useState(false);
  const dispatch = useDispatch();

  const handleChange = () => {
        isChecked === false
      ? dispatch(messageForwardAdd({ msgId: msgid, timestamp, favouriteStatus }))
      : dispatch(messageForwardRemove(msgid));
    setChecked(!isChecked);
    selectedToForward(!isChecked);
  };

  useEffect(() =>{
    const selectedMsgId = data.some(item => item.msgId === msgid);
    if(selectedMsgId){
      setChecked(true)
      selectedToForward(true)
    }
  },[])

  useEffect(() => {
    if (forwardMessageId === msgid && !isChecked && forward) {
      setChecked(true);
      selectedToForward(true);
      dispatch(messageForwardAdd({ msgId: msgid, timestamp, favouriteStatus }));
    }
    if (!forward) {
      setChecked(false);
    }
    return () => selectedToForward(false);
  }, [forward, forwardMessageId]);

  return (
    <Fragment>
      <label className="forwardLabel" htmlFor={"for" + msgid}></label>
      <div className="forwardedMessage">
        <div className="selectForwardMessage">
          <div className="checkbox">
            <input data-jest-id={"jestHandleChange"} checked={isChecked} onChange={handleChange} id={"for" + msgid} type="checkbox" />
            <label htmlFor={"for" + msgid}></label>
          </div>
        </div>
      </div>
      <div></div>
    </Fragment>
  );
}
