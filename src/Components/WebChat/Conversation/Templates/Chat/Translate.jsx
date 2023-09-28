import React from "react";
const HtmlToReactParser = require('html-to-react').Parser;
const htmlToReactParser = new HtmlToReactParser();

const Translate = ({ tMessage }) => {
  return (
    <div className="translated">
      <span>{htmlToReactParser.parse(tMessage)} </span>
    </div>
  );
};

export default Translate;
