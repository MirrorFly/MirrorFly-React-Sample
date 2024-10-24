import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import { blockOfflineAction } from "../../../Helpers/Utility";
import SDK from "../../SDK";
import { encryptAndStoreInLocalStorage} from "../../WebChat/WebChatEncryptDecrypt";
import CommonInputTag from "./CommonInputTag";
import { handleOnlyNumber } from "./otpCommon";

const OTP_NO_OF_CHAR = 6;

function GetOtp(props = {}) {
  const [otpError, setOtpError] = useState("");
  const [loginConfirmCancelPopup, setLoginConfirmCancelPopup] = useState(false);
  const {
    toast,
    sendOtp,
    otp = {},
    regMobileNo,
    handleChanges,
    fullPageLoader,
    handleOtpverify,
    handleReEnterNo,
    handlecancelFromPopup,
    handleBlockedInfo = () => {}
  } = props;
  const regexPattern = /\D/g;

  // Resend OTP
  const handleOtpResend = () => {
    if (blockOfflineAction()) return;

    setOtpError("");
    fullPageLoader(true);
    sendOtp();
  };

  //SEND OTP
  const submitOtp = () => {
    
    if (blockOfflineAction()) return;

    fullPageLoader(false);
    let otpInput = "111111";
    if (otpInput.length === 0) {
      setOtpError("Please enter OTP");
    } else if (otpInput.length !== 6 || Number.isNaN(otpInput)) {
      setOtpError("Please enter valid OTP");
    } else {
      setOtpError("");
      if (otpInput) {
        handleLoginConfirm(false);
      } else {
        toast.error("The server is not responding. Please try again later");
      }
    }
  };

  const inputfocus = (elmnt) => {
    elmnt.preventDefault();
    const unicode = elmnt.keyCode ? elmnt.keyCode : elmnt.charCode;
    if (unicode === 13) {
      submitOtp();
    } else if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
      const next = elmnt.target.tabIndex - 2;
      if (next > -1) {
        elmnt.target.form.elements[next].focus();
      }
    } else if (unicode >= 48 && unicode <= 57) {
      const next = elmnt.target.tabIndex;
      if (next < 6) {
        if(elmnt.target.value){
          elmnt.target.form.elements[next].focus();
        }
    }
    }
  };

  const handleLoginConfirm = async (forceLogin = true) => {
    if(forceLogin === true){
      setLoginConfirmCancelPopup(false);
      fullPageLoader(true);
    }
    const userIdentifier = `${regMobileNo.countryCode.replace(regexPattern, "")}${regMobileNo.mobileNumber}`;
    const registerResult = await SDK.register(userIdentifier, forceLogin);
    if(registerResult.statusCode === 200){
      const { data: { username = "", password = "", token = ""} = {} } =
      registerResult;
      if (username && password) {
        const loginData = {
          username,
          password,
          type: "web"
        };
        encryptAndStoreInLocalStorage("auth_user", loginData);
        const loginResult = await SDK.connect(username, password);

        if (loginResult.statusCode === 200) {
          encryptAndStoreInLocalStorage("token", token);
          SDK.setUserToken(token);
          handleOtpverify(userIdentifier, registerResult.data, loginData);
        }
      } else {
        toast.error("Login Failed!");
      }
    }else if(registerResult.statusCode === 403){
      fullPageLoader(false);
      handleBlockedInfo();
    }else if(registerResult.statusCode === 405){
      fullPageLoader(false);
      setLoginConfirmCancelPopup(true);
    }else{
      fullPageLoader(false);
      toast.error(registerResult.message);
    }

  }

  return (
    <React.Fragment>
      <form className="otpForm" id="otpForm">
        <div className="heading">
          <h4>Verify OTP</h4>
        </div>
        <div className="register_help_text">
          <span className="">
            We have sent you a SMS. To complete the Registration, enter the 6 digit activation code below
          </span>
        </div>
        <div className="otp-input">
          {Array(OTP_NO_OF_CHAR)
            .fill(null)
            .map((_, i) => (
              <CommonInputTag
                key={`otp${i + 1}`}
                type={"text"}
                name={`otp${i + 1}`}
                id={`otp${i + 1}`}
                maxLength={"1"}
                value={otp[`otp${i + 1}`]}
                onChange={(e) => handleChanges(`otp${i + 1}`, e)}
                onKeyUp={inputfocus}
                onKeyPress={handleOnlyNumber}
                tabIndex={i + 1}
                autoComplete={false}
              />
            ))}

          {otpError && (
            <span id="otp-error" className="error">
              {otpError}
            </span>
          )}
        </div>
        <button onClick={submitOtp} className="btn_lg_rounded" id="VerifyOtp" type="button">
          Verify OTP
        </button>
        <div className="Links">
          <span onClick={handleReEnterNo} className="changeNum" id="changeNum">
            Change Number
          </span>
          <span onClick={handleOtpResend} className="resendOtp" id="resendOtp">
            Resend OTP
          </span>
        </div>
      {loginConfirmCancelPopup &&
        <>
          <div className="userprofile logout">
            <div className="logout-popup">
              <div className="logout-label">
                <label>You have reached the maximum device limit. If you want to continue, one of your device
                   will logged out. Do you want to continue?</label>
              </div>
              <div className="logout-noteinfo">
                <button
                  type="button"
                  name="btn-cancel"
                  className="btn-cancel"
                  data-id={"jesthandleLogoutCancel"}
                  onClick={handlecancelFromPopup}>
                  {"Cancel"}
                </button>
                <button
                  type="button"
                  name="btn-logout"
                  className="btn-logout"
                  data-id={"jesthandleLogout"}
                  onClick={(e)=>handleLoginConfirm(true)}>
                  {"Confirm"}
                </button>
              </div>
            </div>
          </div>
              <ToastContainer/>
        </>
      }
      </form>
    </React.Fragment>
  );
}

export default GetOtp;
