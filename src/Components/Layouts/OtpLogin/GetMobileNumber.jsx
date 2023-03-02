import React, { useState } from "react";
import { handleOnlyNumber } from "./otpCommon";
import { DropdownArrow2 } from "../../../assets/images";
import { blockOfflineAction } from "../../../Helpers/Utility";
import { countriescodes } from "../../../Helpers/countries.js";
import { REACT_APP_PRIVACY_POLICY, REACT_APP_TERMS_AND_CONDITIONS } from "../../processENV";

function GetMobileNumber(props = {}) {
  const { regMobileNo = {}, handleChanges, errorHide = false, sendOtp } = props;
  const [errorMsg, setErrorMsg] = useState(errorHide);
  const [countryCodeError, setCountryCodeError] = useState("");

  const handleValidate = () => {
    if (blockOfflineAction()) return;

    const phoneValue = regMobileNo.mobileNumber;
    if (!regMobileNo.countryCode) {
      setCountryCodeError("Please select country code");
    } else if (phoneValue === "") {
      setErrorMsg("Please enter your mobile number");
    } else if (phoneValue.length < 7 || phoneValue.length > 15 || isNaN(phoneValue)) {
      setErrorMsg("Please enter valid mobile number");
    } else {
      setErrorMsg("");
      sendOtp();
    }
  };

  const handleCountryCodeChange = (e) => {
    if (e.target.value && countryCodeError) setCountryCodeError("");
    handleChanges(e);
  };

  const handleTextPaste = (e) => {
    let paste = (e.clipboardData || window.clipboardData).getData("text");
    e.preventDefault();
    handleChanges({
      target: {
        name: "mobileNumber",
        value: paste.replace(/\D/g, "").slice(0, 15)
      }
    });
  };

  return (
    <form id="loginForm" className="loginForm" action="">
      <div className="form-group">
        <div className="inputGroup">
          <label htmlFor="country" className="dropArrow">
            <DropdownArrow2 />
          </label>
          <select
            id="country"
            className="countrySelect"
            value={regMobileNo.country}
            onChange={handleCountryCodeChange}
            name="country"
          >
            <option value={""} disabled>
              Please Select
            </option>
            {countriescodes.map((countries) => {
              return (
                <option value={countries.code} defaultValue={countries.name} key={countries.code}>
                  {countries.name}
                </option>
              );
            })}
          </select>
          {countryCodeError && (
            <span id="phone-error" className="error">
              {countryCodeError}
            </span>
          )}
        </div>
      </div>
      <div className="form-group">
        <div className="inputGroup countryInput">
          <span className="countryCode" id="countryCode">
            {regMobileNo.countryCode}
          </span>
          <input
            onKeyPress={handleOnlyNumber}
            value={regMobileNo.mobileNumber}
            onChange={handleChanges}
            name="mobileNumber"
            placeholder="Enter Mobile Number"
            type="text"
            onPaste={handleTextPaste}
          />
          {errorMsg && (
            <span id="phone-error" className="error">
              {errorMsg}
            </span>
          )}
        </div>
      </div>
      <button id="GetOtp" className="btn_lg_rounded" onClick={handleValidate} type="button">
        Continue
      </button>
      <div className="privary_policy_wrapper">
        <p>By clicking continue you agree to MirrorFly</p>
        <div className="privary_policy_Link">
          <a
            target="_blank"
            href={`${REACT_APP_TERMS_AND_CONDITIONS}`}
            rel="noopener noreferrer">Terms and Conditions,</a> <a
              target="_blank"
              href={`${REACT_APP_PRIVACY_POLICY}`}
              rel="noopener noreferrer">Privacy Policy.</a>
        </div>
      </div>
    </form>
  );
}

export default GetMobileNumber;
