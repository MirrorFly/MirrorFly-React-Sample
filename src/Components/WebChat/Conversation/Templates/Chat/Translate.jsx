import React from "react";
import renderHTML  from 'react-render-html';

const Translate = ({ tMessage }) => {
  return (
    <div className="translated">
      <span>{renderHTML(tMessage)} </span>
    </div>
  );
};

export default Translate;
