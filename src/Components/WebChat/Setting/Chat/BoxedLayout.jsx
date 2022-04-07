import React, { useState, useEffect } from "react";
import { blockOfflineAction, setLocalWebsettings } from "../../../../Helpers/Utility";

const BoxedLayout = (props = {}) => {
  const { id = "", dafaultValue = false, label = "", children } = props;
  const [checkValue, setCheckValue] = useState(true);

  const handleBoxedLayout = (value) => {
    if (blockOfflineAction()) return;

    setCheckValue(value);
    if (value) document.getElementById("root").classList.add("boxLayout");
    else document.getElementById("root").classList.remove("boxLayout");
    setLocalWebsettings("boxLayout", value);
  };

  useEffect(() => {
    setCheckValue(dafaultValue);
  }, [dafaultValue]);

  return (
    <li className="setting-list">
      <label className="setting-option">
        <div className="checkbox">
          <input
            name={id}
            type="checkbox"
            checked={checkValue}
            id={id}
            onChange={(e) => handleBoxedLayout(e.target.checked)}
          />
          <label htmlFor={id}></label>
        </div>
        <div className="label">
          <span className="label-text">{label}</span>
        </div>
      </label>
      {children}
    </li>
  );
};

export default BoxedLayout;
