"use strict";

exports.__esModule = true;
exports.default = undefined;

var _audioRecorderPolyfill = require("audio-recorder-polyfill");

var _audioRecorderPolyfill2 = _interopRequireDefault(_audioRecorderPolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mediaRecorder = void 0;
var chunks = [];
var startTime = void 0;
var mediaOptions = void 0;
var onStartCallback = void 0;
var onStopCallback = void 0;
var onSaveCallback = void 0;
var onDataCallback = void 0;

var constraints = { audio: true };

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var MicrophoneRecorder = function MicrophoneRecorder(onStart, onStop, onSave, onData, options) {
  var _this = this;

  _classCallCheck(this, MicrophoneRecorder);

  this.startRecording = function () {
    startTime = Date.now();
    chunks = [];
    mediaRecorder = null;

    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia(constraints).then(function (str) {
        mediaRecorder = new _audioRecorderPolyfill2.default(str);
        if (onStartCallback) {
          onStartCallback();
        }
        mediaRecorder.addEventListener("dataavailable", function (e) {
          chunks = e.data;
          if (onDataCallback) {
            onDataCallback(e.data);
          }
        });

        mediaRecorder.start();
        mediaRecorder.addEventListener("stop", _this.onStop);
      });
    } else {
      alert("Your browser does not support audio recording");
    }
  };

  this.stopRecording = function () {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks()[0].stop();
      mediaRecorder.stream.getTracks().forEach(function (i) {
        return i.stop();
      });
    }
  };

  this.onStop = function () {
    var blobObject = {
      blob: chunks,
      startTime: startTime,
      stopTime: window.Date.now(),
      options: mediaOptions,
      blobURL: window.URL.createObjectURL(chunks)
    };

    if (onStopCallback) {
      onStopCallback(blobObject);
    }
    if (onSaveCallback) {
      onSaveCallback(blobObject);
    }
  };

  onStartCallback = onStart;
  onStopCallback = onStop;
  onSaveCallback = onSave;
  onDataCallback = onData;
  mediaOptions = options;
};

exports.default = MicrophoneRecorder;
module.exports = exports["default"];