var audioCtx = checkBrowserSupport;
if (audioCtx) {
  var _analyser = audioCtx.createAnalyser();
}

var AudioContext = {
  getAudioContext: function getAudioContext() {
    return audioCtx;
  },
  getAnalyser: function getAnalyser() {
    return analyser;
  }
};

var checkBrowserSupport = function checkBrowserSupport() {
  if (typeof AudioContext !== "undefined") {
    return new window.AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
    return new window.webkitAudioContext();
  } else if (typeof mozAudioContext !== "undefined") {
    return new window.mozAudioContext();
  } else {
    return false;
  }
};

export default AudioContext;