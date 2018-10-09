let audioCtx = null
let analiser = null

const checkBrowserSupport = () =>
  new Promise((resolve, reject) => {
    if (typeof AudioContext !== "undefined") {
      resolve(new window.AudioContext());
     } else if (typeof webkitAudioContext !== "undefined") {
      resolve(new window.webkitAudioContext())
     } else if (typeof mozAudioContext !== "undefined") {
      resolve(new window.mozAudioContext())
     } else {
      resolve(false)
    }
  })

console.log('here', typeof AudioContext !== "undefined");

checkBrowserSupport()
  .then(res => {
    console.log('aaaaa', res);
    audioCtx = res
    if (audioCtx) {
      analyser = audioCtx.createAnalyser();
    }
});

const AudioContext  = {
  getAudioContext() {
    return audioCtx;
  },

  getAnalyser() {
    return analyser;
  }
}

export default AudioContext;
