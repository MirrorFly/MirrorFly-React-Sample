import React, { useState, useEffect } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { DropdownArrow2 } from '../../../../assets/images';
import { countriescodes } from '../../../../Helpers/countries';
import { blockOfflineAction, isAppOnline } from '../../../../Helpers/Utility';
import { handleOnlyNumber } from '../../../Layouts/OtpLogin/otpCommon';
import { IconTriangle } from '../images';
import ActionInfoPopup from '../../../ActionInfoPopup/index';
import Store from '../../../../Store';

const NumberVerificationForm = (props = {}) => {
    let unmounted = false;
    const { handleNumberVerified = () => { } } = props;
    const globalData = Store.getState();
    let { vCardData: { data: { mobileNumber: mobile = '' } } } = globalData || {}
    const [regMobileNo, setRegMobileNo] = useState({
        mobileNumber: "",
        country: "",
        countryCode: ""
    });
    const { mobileNumber, country, countryCode } = regMobileNo;
    const [error, setError] = useState({
        errorPopup: false,
        errorMessage: "",
    });
    const { errorPopup, errorMessage } = error
    const [dropActive, setDropActive] = useState(false);

    const handleCountryCodeChange = (e) => {
        setRegMobileNo({
            ...regMobileNo,
            country: e.target.getAttribute('data-value'),
            countryCode: e.target.value,
        });
    };

    const handleValidate = () => {
        if (blockOfflineAction()) return;
        const numberCountryCode = countryCode + regMobileNo.mobileNumber
        let phoneValue = numberCountryCode.replace("+", "");
        phoneValue = phoneValue.replace(" ", "");
        mobile = mobile.replace("+", "");
        mobile = mobile.replace(" ", "");
        if (!countryCode) {
            setError({
                ...error,
                errorPopup: true,
                errorMessage: "Please select country"
            });
            return;
        }
        if (mobileNumber === "") {
            setError({
                ...error,
                errorPopup: true,
                errorMessage: "Please enter your mobile number"
            });
            return;
        }
        if (phoneValue.length < 7 || phoneValue.length > 15 || isNaN(phoneValue)) {
            setError({
                ...error,
                errorPopup: true,
                errorMessage: "Please enter valid mobile number"
            });
            return;
        }
        if (phoneValue !== mobile) {
            setError({
                ...error,
                errorPopup: true,
                errorMessage: "The mobile number you entered doesn't match your account."
            });
            return;
        }

        setError({
            ...error,
            errorPopup: false,
            errorMessage: ""
        });
        handleNumberVerified(true);
    };

    const handleChanges = (e) => {
        setRegMobileNo({
            ...regMobileNo,
            mobileNumber: e.target.value,
        })
    }

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

    const searchCountry = (e = {}) => {
        const value = e?.target?.value;
        setRegMobileNo({
            ...regMobileNo,
            country: value
        });
        const search = value.toLowerCase();
        const countryList = document.querySelectorAll(".drop_options_list");
        for (const i of countryList) {
            const item = i.innerHTML.toLowerCase();
            if (item.indexOf(search) === -1) {
                i.style.display = "none";
            } else {
                i.style.display = "block";
            }
        }
    };

    const getCountryCode = async () => {
        fetch("https://geolocation-db.com/json/")
            .then((response) => response.json())
            .then(function (data) {
                if (data?.country_code) {
                    const countryDetails = countriescodes.find((el) => el.code === data.country_code);
                    if (countryDetails && !unmounted) {
                        setRegMobileNo({
                            ...regMobileNo,
                            country: countryDetails.name,
                            countryCode: countryDetails.dial_code
                        });
                    }
                }
            })
            .catch(() => { });
    };

    useEffect(() => {
        getCountryCode();
        return () => {
            unmounted = true;
        };
    }, []);

    return (
        <React.Fragment>

            <form className='delete_acc_wrapper'>
                <div className='info_wraper'>
                    <IconTriangle className='icon_info_danger' />
                    <p className='info-danger'>Deleting your account will:</p>
                </div>
                <ul className='info_points'>
                    <li>
                        <p>Delete your account from MirrorFly</p>
                    </li>
                    <li>
                        <p>Erase your message history</p>
                    </li>
                    <li>
                        <p>Delete you from all of your MirrorFly groups</p>
                    </li>
                </ul>
                <strong>To delete your account, confirm your country and enter your phone number.</strong>

                <div className='drop_custom'>
                    <label htmlFor="">
                        Country
                    </label>
                    <div className={`${dropActive ? " open " : " "} form-group `}>

                        <div className={`${dropActive ? " open " : " "} inputGroup `}>
                            <label htmlFor="country"
                                onClick={() => setDropActive(!dropActive)}
                                className={`${dropActive ? " open " : " "} dropArrow `}>
                                <DropdownArrow2 
                                className={`${dropActive ? " open " : " "} `}
                                style={{ transform: dropActive ? "rotate(-180deg)" : "rotate(0deg)" }} />
                            </label>
                            <div
                                id="country"
                                className={`${dropActive ? " open " : ""} DropContainer`}
                                onClick={() => setDropActive(!dropActive)}
                            >
                                <input
                                    className={`${dropActive ? " open " : ""} country_input`}
                                    placeholder="Choose a country"
                                    readOnly={!isAppOnline() ? true : false}
                                    onChange={(e) => !blockOfflineAction() ? searchCountry(e) : null}
                                    value={country}
                                />
                                {dropActive &&
                                    <OutsideClickHandler onOutsideClick={(event) => {
                                        if (event.target.classList.contains('open')) return
                                        setDropActive(false);
                                    }}>
                                        <div className='drop_options'>
                                            {countriescodes.map((countries) => {
                                                return (
                                                    <button type='button'
                                                        className='drop_options_list'
                                                        onClick={handleCountryCodeChange}
                                                        value={countries.dial_code} data-value={countries.name} key={countries.code}>
                                                        {countries.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </OutsideClickHandler>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="form-group mobile_number_Wraper">
                    <label htmlFor="mobile_number">
                        Mobile number
                    </label>
                    <div className="inputGroup countryInput">
                        <span className="countryCode" id="countryCode">
                            {regMobileNo.countryCode}
                        </span>
                        <input
                            id='mobile_number'
                            onKeyPress={handleOnlyNumber}
                            value={mobileNumber}
                            onChange={(e) => handleChanges(e)}
                            name="mobileNumber"
                            placeholder="Enter Mobile Number"
                            type="text"
                            onPaste={handleTextPaste}
                        />
                    </div>
                </div>
                <div className='delete_acc_footer'>
                    <button className='btn_continue' onClick={() => handleValidate()} type="button" >
                        Continue
                    </button>
                </div>
                {errorPopup &&
                    <ActionInfoPopup
                        textActionBtn={"Ok"}
                        handleAction={() => setError({ ...error, errorPopup: false })}
                        textInfo={errorMessage}
                    />
                }
            </form>
        </React.Fragment>
    );
};

export default NumberVerificationForm;