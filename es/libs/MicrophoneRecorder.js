function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import AudioContext from './AudioContext';
import MediaRecorder from 'audio-recorder-polyfill';

var analyser = void 0;
var audioCtx = void 0;
var mediaRecorder = void 0;
var chunks = [];
var startTime = void 0;
var stream = void 0;
var mediaOptions = void 0;
var blobObject = void 0;
var onStartCallback = void 0;
var onStopCallback = void 0;
var onSaveCallback = void 0;
var onDataCallback = void 0;

var constraints = { audio: true };

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

export var MicrophoneRecorder = function () {
  function MicrophoneRecorder(onStart, onStop, onSave, onData, options) {
    var _this = this;

    _classCallCheck(this, MicrophoneRecorder);

    this.startRecording = function () {
      startTime = Date.now();
      analyser = null;
      audioCtx = null;
      chunks = [];
      stream = null;
      blobObject = null;
      mediaRecorder = null;

      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constraints).then(function (str) {
          stream = str;
          mediaRecorder = new MediaRecorder(str);
          if (onStartCallback) {
            onStartCallback();
          };
          mediaRecorder.addEventListener('dataavailable', function (e) {
            chunks = e.data;
            if (onDataCallback) {
              onDataCallback(e.data);
            }
          });

          mediaRecorder.start();
          mediaRecorder.addEventListener('stop', _this.onStop);
        });
      } else {
        alert('Your browser does not support audio recording');
      }
    };

    onStartCallback = onStart;
    onStopCallback = onStop;
    onSaveCallback = onSave;
    onDataCallback = onData;
    mediaOptions = options;
  }

  MicrophoneRecorder.prototype.stopRecording = function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks()[0].stop();
      mediaRecorder.stream.getTracks().forEach(function (i) {
        return i.stop();
      });
    }
  };

  MicrophoneRecorder.prototype.onStop = function onStop() {
    var blobObject = {
      blob: chunks,
      startTime: startTime,
      stopTime: window.Date.now(),
      options: mediaOptions,
      blobURL: window.URL.createObjectURL(chunks)
    };

    if (onStopCallback) {
      onStopCallback(blobObject);
    };
    if (onSaveCallback) {
      onSaveCallback(blobObject);
    };
  };

  return MicrophoneRecorder;
}();