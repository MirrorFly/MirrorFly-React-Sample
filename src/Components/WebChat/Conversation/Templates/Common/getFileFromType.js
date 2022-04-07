import { Excel, Pdf, Placeholder, Txt, Word, Ppt, Zip, Rar, Csv } from "../../../../../assets/images";

const getFile = (fileType, extension) => {
  const getLowercase = extension ? extension.toString().toLowerCase() : "";
  if (getLowercase === ".doc" || getLowercase === ".docx" || fileType === "application/msword") {
    return Word;
  } else if (getLowercase === ".xls" || getLowercase === ".xlsx" || fileType === "application/vnd.ms-excel") {
    return Excel;
  } else if (getLowercase === ".txt" || fileType === "text/plain") {
    return Txt;
  } else if (getLowercase === ".pdf" || fileType === "application/pdf") {
    return Pdf;
  } else if (getLowercase === ".csv" || fileType === "application/csv") {
    return Csv;
  } else if (
    getLowercase === ".ppt" ||
    getLowercase === ".pptx" ||
    fileType === "application/ppt" ||
    fileType === "application/pptx"
  ) {
    return Ppt;
  } else if (getLowercase === ".zip" || fileType === "application/zip" || fileType === "application/x-zip-compressed") {
    return Zip;
  } else if (getLowercase === ".rar" || fileType === "application/rar" || fileType === "application/vnd.rar") {
    return Rar;
  } else {
    return Placeholder;
  }
};

const getFileFromType = (fileType, extension) => {
  return getFile(fileType, extension);
};

export default getFileFromType;
