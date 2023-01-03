import React, { useState } from "react";
import { blockOfflineAction } from "../../../Helpers/Utility";
import SDK from "../../SDK";
import { encryptAndStoreInLocalStorage} from "../../WebChat/WebChatEncryptDecrypt";
import CommonInputTag from "./CommonInputTag";
import { handleOnlyNumber } from "./otpCommon";

const OTP_NO_OF_CHAR = 6;

function GetOtp(props = {}) {
  const [otpError, setOtpError] = useState("");
  const {
    toast,
    sendOtp,
    otp = {},
    regMobileNo,
    handleChanges,
    fullPageLoader,
    handleOtpverify,
    handleReEnterNo,
    handleBlockedInfo = () => {}
  } = props;

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
    let otpInput = "";
    const input = Object.keys(otp);
    for (var i = 0; i < input.length; i++) {
      otpInput += otp[input[i]];
    }

    if (otpInput.length === 0) {
      setOtpError("Please enter OTP");
    } else if (otpInput.length !== 6 || isNaN(otpInput)) {
      setOtpError("Please enter valid OTP");
    } else {
      setOtpError("");
      if (window.confirmationResult) {
        fullPageLoader(true);
        window.confirmationResult
          .confirm(otpInput)
          .then(async (result) => {
            if (result.user) {
              const userIdentifier = `${regMobileNo.countryCode.replace("+", "")}${regMobileNo.mobileNumber}`;
              const registerResult = await SDK.register(userIdentifier);

              if (registerResult.statusCode === 200) {
                const { data: { username = "", password = "", token = "", isProfileUpdated = false } = {} } =
                  registerResult;

                if (username && password) {
                  const loginResult = await SDK.connect(username, password);

                  if (loginResult.statusCode === 200) {
                    const loginData = {
                      username,
                      password,
                      type: "web"
                    };
                    isProfileUpdated && encryptAndStoreInLocalStorage("auth_user", loginData);
                    encryptAndStoreInLocalStorage("token", token);
                    SDK.setUserToken(token);

                    // if (isSandboxMode() && registerResult.data?.isProfileUpdated) {
                    //   await SDK.syncContacts(username);
                    // }
                    handleOtpverify(userIdentifier, registerResult.data, loginData);
                  }
                } else {
                  toast.error("Login Failed!");
                }
              } else if (registerResult.statusCode === 403) {
                fullPageLoader(false);
                handleBlockedInfo();
              } else {
                fullPageLoader(false);
                toast.error(registerResult.message);
              }
            } else {
              toast.error("The server is not responding. Please try again later");
            }
          })
          .catch((err) => {
            console.log("OTP Validation Error :>> ", err);
            fullPageLoader(false);
            if (err.code === "auth/invalid-verification-code") {
              setOtpError("OTP mismatched. Please enter the valid OTP.");
            } else if (err.code === "auth/code-expired") {
              toast.error("OTP expired, Enter new OTP and try again!");
            } else if (err.code === "auth/network-request-failed") {
              toast.error("Please check your Internet connectivity");
            } else {
              toast.error("The server is not responding. Please try again later");
            }
          });
      } else {
        fullPageLoader(false);
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
                key={i + 1}
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
        <button onClick={submitOtp} id="VerifyOtp" type="button">
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
      </form>
    </React.Fragment>
  );
}

export default GetOtp;
