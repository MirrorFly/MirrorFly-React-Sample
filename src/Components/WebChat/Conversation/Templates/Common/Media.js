export const getCameraPermission = () => {
  return new Promise((resolve) => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true
      })
      .then((stream) => {
        const tracks = (stream && stream.getTracks()) || [];
        resolve(tracks)
      })
      .catch(() => resolve(false));
  });
};
