import React from 'react';
import './CommonSwitch.scss';

const CommonSwitch = (props = {}) => {
    const { id = 1, checked = false, handleClick } = props;
    return (
        <label
            className="switch"
        >
            <input
                onChange={() => { }}
                className={checked ? "active" : ""}
                type="checkbox"
                id={`Status-${id}`}
                checked={checked ? true : false}
            />
            <span className="slider round"></span>
            <label onClick={handleClick} className="overlay-click"></label>
        </label>
    );
}

export default CommonSwitch;