import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateUserList } from "./CustomToast";

const positionToast = "bottom-right"; /*position to place */

const ToastServices = {
  ParticipantToast: (content, toastId, displayName, type) =>
    toast(content, {
      position: positionToast,
      autoClose: true,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      className: "ParticipantToast",
      toastId,
      onClose: () => {
        updateUserList(type, displayName, "close");
      }
    })
};
export default ToastServices;
