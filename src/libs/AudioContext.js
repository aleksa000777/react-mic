const audioCtx = checkBrowserSupport;
if (audioCtx) {
  const analyser = audioCtx.createAnalyser();
}

const AudioContext  = {
  getAudioContext() {
    return audioCtx;
  },

  getAnalyser() {
    return analyser;
  }
}

const checkBrowserSupport = () => {
  if (typeof AudioContext !== "undefined") {
    return new window.AudioContext();
   } else if (typeof webkitAudioContext !== "undefined") {
    return new window.webkitAudioContext();
   } else if (typeof mozAudioContext !== "undefined") {
    return new window.mozAudioContext();
   } else {
    return false
  }
}

export default AudioContext;
