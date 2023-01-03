import React, { Fragment, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { EventWaiting, LoginInfo, NewLogoVector } from "../../../assets/images";
import { countriescodes } from "../../../Helpers/countries";
import GetMobileNumber from "./GetMobileNumber";
import GetOtp from "./GetOtp";
import ProfileUpdate from "./ProfileUpdate";
import "./login.scss";
import config from "../../../config";
import firebase from "./firebaseConfig";
import { DEFAULT_USER_STATUS } from "../../../Helpers/Chat/Constant";
import OutsideClickHandler from "react-outside-click-handler";
import BlockedFromApplication from "../../BlockedFromApplication";

const { helpUrl } = config;
const otpInitialState = {
  otp1: "",
  otp2: "",
  otp3: "",
  otp4: "",
  otp5: "",
  otp6: ""
};
let unmounted = false;

function OtpLogin(props = {}) {
  const { handleLoginSuccess, qrCode = "", handleSDKIntialize } = props;
  const [resultData, setResultData] = useState({});
  const [pageLoader, setPageLoader] = useState(false);
  const [errorHide, setErrorHide] = useState(false);
  const [adminBlocked, setAdminBlocked] = useState(false);
  const [regMobileNo, setRegMobileNo] = useState({
    mobileNumber: "",
    country: "",
    countryCode: ""
  });
  const [otpverify, setOtpverify] = useState(otpInitialState);
  const [validate, setValidate] = useState({
    getMobileNo: true,
    getOtpVerfied: false,
    getProfileDetails: false
  });
  const [profileDetails, setProfileDetails] = useState({
    profileImg: "",
    username: "",
    email: "",
    mobileNo: "",
    status: DEFAULT_USER_STATUS
  });

  const getCountryCode = async () => {
    fetch("https://geolocation-db.com/json/")
      .then((response) => response.json())
      .then(function (data) {
        if (data?.country_code) {
          const country = countriescodes.find((el) => el.code === data.country_code);
          if (country && !unmounted) {
            setRegMobileNo({
              ...regMobileNo,
              country: country.code,
              countryCode: country.dial_code
            });
          }
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
      size: "invisible"
    });
    getCountryCode();
    return () => {
      unmounted = true;
    };
  }, []);

  const handleRegMobileNo = (event) => {
    setValidate({
      ...validate,
      getMobileNo: false,
      getOtpVerfied: true
    });
    setPageLoader(false);
  };

  const setCountryCode = (event) => {
    setRegMobileNo({ ...regMobileNo, countryCode: event.target.value });
  };

  const handleChangesMobile = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      const country = countriescodes.find((el) => el.code === value);
      setRegMobileNo({
        ...regMobileNo,
        [name]: value,
        countryCode: country.dial_code
      });
    } else {
      setRegMobileNo({
        ...regMobileNo,
        [name]: value
      });
    }
    setErrorHide("");
  };

  const handleChangesOtp = (value1, e) => {
    setOtpverify({ ...otpverify, [value1]: e.target.value });
  };

  const handleOtpverify = async (mobileNo, register, login) => {
    setResultData({ register, login });
    if (!register?.isProfileUpdated) {
      setProfileDetails({
        ...profileDetails,
        mobileNo: mobileNo,
        loginData: login,
        registerData: register
      });
      setValidate({
        ...validate,
        getOtpVerfied: false,
        getProfileDetails: true
      });
      setPageLoader(false);
    } else {
      handleLoginSuccess(register, login);
    }
  };

  const handleReEnterNo = () => {
    setValidate({
      ...validate,
      getMobileNo: true,
      getOtpVerfied: false
    });
    setOtpverify(otpInitialState);
    handleSDKIntialize();
    setPageLoader(false);
  };

  const handleProfileDetails = async (value1, e) => {
    // if (isSandboxMode()) {
    //   await SDK.syncContacts(resultData.login.username);      
    // }
    // if (profileDetails && profileDetails.registerData && !profileDetails.registerData.isProfileUpdated) {
    //   SDK.sendRegisterUpdate();
    // }
    handleLoginSuccess(resultData.register, resultData.login);
  };

  const handleChangesProfile = (param, value) => {
    setProfileDetails({
      ...profileDetails,
      [param]: value
    });
  };

  const removeProfileImage = () => {
    setProfileDetails({
      ...profileDetails,
      profileImage: ""
    });
  };

  const fullPageLoader = (status) => {
    setPageLoader(status);
  };
  const handleBlockedInfo = () => {
    setValidate({
      ...validate,
      getOtpVerfied: false,
    });
    setAdminBlocked(true);
  };

  const sendOtp = () => {
    setTimeout(() => fullPageLoader(true), 100);
    const countryCode = regMobileNo.countryCode;
    const phoneValue = regMobileNo.mobileNumber;
    const phoneNumber = `${countryCode}${phoneValue}`;
    setOtpverify(otpInitialState);

    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
      .then(function (confirmationResult) {
        window.confirmationResult = confirmationResult;
        handleRegMobileNo();
        toast.info("OTP is sent to your mobile number");
      })
      .catch((err) => {
        fullPageLoader(false);
        console.log("Login Error :>> ", err);
        if (err.code === "auth/too-many-requests") {
          toast.error("Too Many Requests. Try again later!");
        } else if (err.code === "auth/network-request-failed") {
          toast.error("Please check your Internet connectivity");
        } else if (err.code === "auth/invalid-phone-number") {
          toast.error("Please enter a valid mobile number");
        } else if (err.code === "auth/captcha-check-failed") {
          toast.error("Captcha Check Failed");
        } else {
          toast.error("The server is not responding. Please try again later");
        }
      });
  };

  const handleCaptchaOutsideClick = () => {
    const captchaChildren = document.getElementById("recaptcha-container").hasChildNodes();
    if (pageLoader && captchaChildren) {
      setPageLoader(false);
    }
  };

  return (
    <Fragment>
      <div className="mirrorfly newLoginScreen">
        <div
          className={`login-wrapper ${validate.getMobileNo ? " otpWrapper " : ""} ${validate.getOtpVerfied ? " getotpWrapper " : ""
            } ${validate.getProfileDetails ? " profileWrapper " : ""}`}
        >
          <div className="login-content">
            {validate.getMobileNo && (
              <div className="left-col">
                {qrCode ? qrCode : ""}
                <div className="getStarted">
                  <a className="" target={"_blank"} rel="noopener noreferrer" href={helpUrl}>
                    Need help to get started?
                  </a>
                </div>
                <div className="login_desc">
                  <h3>Log in with QR Code</h3>
                  <ul>
                    <li>
                      <p>
                        1. Open <strong>MirrorFly</strong> on your phone.
                      </p>
                    </li>
                    <li>
                      <p>
                        2. Tap <strong>Menu</strong>{" "}
                        <i className="iconOption">
                          <LoginInfo />
                        </i>{" "}
                        or <span className="ios-icon">+</span> and select <strong>Web.</strong>
                      </p>
                    </li>
                    <li>
                      <p>
                        3. Scan the <strong>QR Code </strong> and get <strong>Logged in.</strong>
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <div
              className={`right-col ${validate.getMobileNo ? "otpPage" : ""} ${validate.getOtpVerfied ? "getotpPage" : ""
                } ${validate.getProfileDetails ? "profilePage" : ""}`}
            >
              <div className="form">
                {validate.getMobileNo && (
                  <div className="form-inner">
                    <div className="company_logo">
                      <img src={NewLogoVector} alt="logo" />
                    </div>
                    <div className="heading">
                      <h4>Register Mobile Number</h4>
                    </div>
                    <div className="register_help_text">
                      <span className="">
                        Please choose your country code and enter your mobile number to get the verification code.
                      </span>
                    </div>
                    <GetMobileNumber
                      regMobileNo={regMobileNo}
                      handleRegMobileNo={(e) => handleRegMobileNo(e)}
                      handleChanges={handleChangesMobile}
                      toast={toast}
                      fullPageLoader={(e) => fullPageLoader(e)}
                      setCountryCode={(e) => setCountryCode(e)}
                      errorHide={errorHide}
                      sendOtp={sendOtp}
                    />
                  </div>
                )}
                {validate.getOtpVerfied && (
                  <GetOtp
                    handleBlockedInfo={handleBlockedInfo}
                    regMobileNo={regMobileNo}
                    otp={otpverify}
                    handleOtpverify={handleOtpverify}
                    handleReEnterNo={handleReEnterNo}
                    handleChanges={handleChangesOtp}
                    toast={toast}
                    fullPageLoader={(e) => fullPageLoader(e)}
                    sendOtp={sendOtp}
                  />
                )}
                {validate.getProfileDetails && (
                  <ProfileUpdate
                    regMobileNo={regMobileNo}
                    profileDetails={profileDetails}
                    handleChangesProfile={handleChangesProfile}
                    handleProfileDetails={handleProfileDetails}
                    fullPageLoader={(e) => fullPageLoader(e)}
                    removeProfileImage={removeProfileImage}
                    toast={toast}
                    fromPage={"otpPage"}
                  />
                )}
                {adminBlocked &&
                  <BlockedFromApplication />
                }
              </div>
              <OutsideClickHandler onOutsideClick={handleCaptchaOutsideClick}>
                <div id="recaptcha-container" className="recaptcha-container"></div>
              </OutsideClickHandler>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
      {pageLoader && (
        <div className="pageLoader">
          <EventWaiting />
        </div>
      )}
    </Fragment>
  );
}

export default OtpLogin;
