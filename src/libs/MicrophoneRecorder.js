import MediaRecorder from "audio-recorder-polyfill";

let mediaRecorder;
let chunks = [];
let startTime;
let mediaOptions;
let onStartCallback;
let onStopCallback;
let onSaveCallback;
let onDataCallback;

const constraints = { audio: true };

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

export default class MicrophoneRecorder {
  constructor(onStart, onStop, onSave, onData, options) {
    onStartCallback = onStart;
    onStopCallback = onStop;
    onSaveCallback = onSave;
    onDataCallback = onData;
    mediaOptions = options;
  }

  startRecording = () => {
    startTime = Date.now();

    if(mediaRecorder) {
      return;
    } else {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constraints).then(str => {
          mediaRecorder = new MediaRecorder(str);
          if (onStartCallback) {
            onStartCallback();
          }
          mediaRecorder.addEventListener("dataavailable", e => {
            chunks = e.data;
            if (onDataCallback) {
              onDataCallback(e.data);
            }
          });

          mediaRecorder.start();
          mediaRecorder.addEventListener("stop", this.onStop);
        });
      } else {
        alert("Your browser does not support audio recording");
      }
    }
  };

  stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks()[0].stop();
      mediaRecorder.stream.getTracks().forEach(i => i.stop());
    }
    mediaRecorder = null
  };

  onStop = () => {
    const blobObject = {
      blob: chunks,
      startTime,
      stopTime: window.Date.now(),
      options: mediaOptions,
      blobURL: window.URL.createObjectURL(chunks)
    };
    chunks = []

    if (onStopCallback) {
      onStopCallback(blobObject);
    }
    if (onSaveCallback) {
      onSaveCallback(blobObject);
    }
  };
}
