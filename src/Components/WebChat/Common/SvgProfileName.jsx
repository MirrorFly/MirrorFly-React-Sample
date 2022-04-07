import React from "react";

function SvgProfileName(props = {}) {
  const { userShortName = "", initialColor = "#0376da" } = props;
  return (
    <div className="svgProfile">
      <svg
        className="avatar-svg"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <circle fill={initialColor} cx="50" cy="50" r="50" />
        <text dominantBaseline="central" fill="rgba(255,255,255,1)" fontSize="24pt" textAnchor="middle" x="50" y="50">
          {userShortName}
        </text>
      </svg>
    </div>
  );
}

export default SvgProfileName;
