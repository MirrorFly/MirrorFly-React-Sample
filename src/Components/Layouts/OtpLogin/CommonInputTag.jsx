import React from 'react';
import propTypes from "prop-types";

const CommonInputTag = (props = {}) => {
    const {
        onBlur,//click
        onChange,//click
        id = "",
        name = "",
        value = "",
        type = "text",
        className = "",
        placeholder = "", //dynamiv placeHolder "string"
        readOnly = false,
        required = false,
        autoFocus = false,
        errMsg = "",
        maxLength = "",
        onKeyUp,
        onPaste,
        autoComplete=false,
        ...rest
     } = props || {};
    return (
        <React.Fragment>
            <input
                formNoValidate
                id={id ? id : ""}
                autoComplete={autoComplete ? "on" : "off"}
                onChange={onChange}
                name={name ? name : ""}
                value={value ? value : ""}
                type={type ? type : "text"}
                onBlur={onBlur ? onBlur : null}
                required={required ? required : ""}
                readOnly={readOnly ? readOnly : false}
                className={className ? className : ""}
                placeholder={placeholder ? placeholder : ""}
                autoFocus={autoFocus === true ? true : false}
                maxLength= {maxLength ? maxLength : ""}
                onKeyUp={onKeyUp}
                onPaste={onPaste ? onPaste : null}
                {...rest}
            />
            <span className="error">{errMsg ? errMsg : null}</span>
        </React.Fragment>
    );
};
CommonInputTag.propTypes = {
    id: propTypes.string,
    onBlur: propTypes.func,
    name: propTypes.string,
    type: propTypes.string,
    value: propTypes.string,
    onChange: propTypes.func,
    readOnly: propTypes.bool,
    required: propTypes.bool,
    autoFocus: propTypes.bool,
    className: propTypes.string,
    placeholder: propTypes.string,
};

export default React.memo(CommonInputTag);
