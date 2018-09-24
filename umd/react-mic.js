/*!
 * react-mic v12.2.2
 * MIT Licensed
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["react-mic"] = factory(require("react"));
	else
		root["react-mic"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_7__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_ReactMic__ = __webpack_require__(3);


/* harmony default export */ __webpack_exports__["default"] = __WEBPACK_IMPORTED_MODULE_0__components_ReactMic__["a" /* default */];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var AudioContext = window.AudioContext || window.webkitAudioContext

function createWorker (fn) {
  var js = fn
    .toString()
    .replace(/^function\s*\(\)\s*{/, '')
    .replace(/}$/, '')
  var blob = new Blob([js])
  return new Worker(URL.createObjectURL(blob))
}

var context

/**
 * Audio Recorder with MediaRecorder API.
 *
 * @param {MediaStream} stream The audio stream to record.
 *
 * @example
 * navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
 *   var recorder = new MediaRecorder(stream)
 * })
 *
 * @class
 */
function MediaRecorder (stream) {
  /**
   * The `MediaStream` passed into the constructor.
   * @type {MediaStream}
   */
  this.stream = stream

  /**
   * The current state of recording process.
   * @type {"inactive"|"recording"|"paused"}
   */
  this.state = 'inactive'

  this.em = document.createDocumentFragment()
  this.encoder = createWorker(MediaRecorder.encoder)

  var recorder = this
  this.encoder.addEventListener('message', function (e) {
    var event = new Event('dataavailable')
    event.data = new Blob([e.data], { type: recorder.mimeType })
    recorder.em.dispatchEvent(event)
    if (recorder.state === 'inactive') {
      recorder.em.dispatchEvent(new Event('stop'))
    }
  })
}

MediaRecorder.prototype = {
  /**
   * The MIME type that is being used for recording.
   * @type {string}
   */
  mimeType: 'audio/wav',

  /**
   * Begins recording media.
   *
   * @param {number} [timeslice] The milliseconds to record into each `Blob`.
   *                             If this parameter isn’t included, single `Blob`
   *                             will be recorded.
   *
   * @return {undefined}
   *
   * @example
   * recordButton.addEventListener('click', function () {
   *   recorder.start()
   * })
   */
  start: function start (timeslice) {
    if (this.state === 'inactive') {
      this.state = 'recording'

      if (!context) {
        context = new AudioContext()
      }
      var input = context.createMediaStreamSource(this.stream)
      var processor = context.createScriptProcessor(2048, 1, 1)

      var recorder = this
      processor.onaudioprocess = function (e) {
        if (recorder.state === 'recording') {
          recorder.encoder.postMessage([
            'encode', e.inputBuffer.getChannelData(0)
          ])
        }
      }

      input.connect(processor)
      processor.connect(context.destination)

      this.em.dispatchEvent(new Event('start'))

      if (timeslice) {
        this.slicing = setInterval(function () {
          if (recorder.state === 'recording') recorder.requestData()
        }, timeslice)
      }
    }
  },

  /**
   * Stop media capture and raise `dataavailable` event with recorded data.
   *
   * @return {undefined}
   *
   * @example
   * finishButton.addEventListener('click', function () {
   *   recorder.stop()
   * })
   */
  stop: function stop () {
    if (this.state !== 'inactive') {
      this.requestData()
      this.state = 'inactive'
      clearInterval(this.slicing)
    }
  },

  /**
   * Pauses recording of media streams.
   *
   * @return {undefined}
   *
   * @example
   * pauseButton.addEventListener('click', function () {
   *   recorder.pause()
   * })
   */
  pause: function pause () {
    if (this.state === 'recording') {
      this.state = 'paused'
      this.em.dispatchEvent(new Event('pause'))
    }
  },

  /**
   * Resumes media recording when it has been previously paused.
   *
   * @return {undefined}
   *
   * @example
   * resumeButton.addEventListener('click', function () {
   *   recorder.resume()
   * })
   */
  resume: function resume () {
    if (this.state === 'paused') {
      this.state = 'recording'
      this.em.dispatchEvent(new Event('resume'))
    }
  },

  /**
   * Raise a `dataavailable` event containing the captured media.
   *
   * @return {undefined}
   *
   * @example
   * this.on('nextData', function () {
   *   recorder.requestData()
   * })
   */
  requestData: function requestData () {
    if (this.state !== 'inactive') {
      this.encoder.postMessage(['dump', context.sampleRate])
    }
  },

  /**
   * Add listener for specified event type.
   *
   * @param {"start"|"stop"|"pause"|"resume"|"dataavailable"} type Event type.
   * @param {function} listener The listener function.
   *
   * @return {undefined}
   *
   * @example
   * recorder.addEventListener('dataavailable', function (e) {
   *   audio.src = URL.createObjectURL(e.data)
   * })
   */
  addEventListener: function addEventListener () {
    this.em.addEventListener.apply(this.em, arguments)
  },

  /**
   * Remove event listener.
   *
   * @param {"start"|"stop"|"pause"|"resume"|"dataavailable"} type Event type.
   * @param {function} listener The same function used in `addEventListener`.
   *
   * @return {undefined}
   */
  removeEventListener: function removeEventListener () {
    this.em.removeEventListener.apply(this.em, arguments)
  },

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {Event} event The event object.
   *
   * @return {boolean} Is event was no canceled by any listener.
   */
  dispatchEvent: function dispatchEvent () {
    this.em.dispatchEvent.apply(this.em, arguments)
  }
}

/**
 * Returns `true` if the MIME type specified is one the polyfill can record.
 *
 * This polyfill supports only `audio/wav`.
 *
 * @param {string} mimeType The mimeType to check.
 *
 * @return {boolean} `true` on `audio/wav` MIME type.
 */
MediaRecorder.isTypeSupported = function isTypeSupported (mimeType) {
  return /audio\/wave?/.test(mimeType)
}

/**
 * `true` if MediaRecorder can not be polyfilled in the current browser.
 * @type {boolean}
 *
 * @example
 * if (MediaRecorder.notSupported) {
 *   showWarning('Audio recording is not supported in this browser')
 * }
 */
MediaRecorder.notSupported = !navigator.mediaDevices || !AudioContext

/**
 * Converts RAW audio buffer to compressed audio files.
 * It will be loaded to Web Worker.
 * By default, WAVE encoder will be used.
 * @type {function}
 *
 * @example
 * MediaRecorder.prototype.mimeType = 'audio/ogg'
 * MediaRecorder.encoder = oggEncoder
 */
MediaRecorder.encoder = __webpack_require__(2)

module.exports = MediaRecorder


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Copied from https://github.com/chris-rudmin/Recorderjs

module.exports = function () {
  var BYTES_PER_SAMPLE = 2

  var recorded = []

  function encode (buffer) {
    var length = buffer.length
    var data = new Uint8Array(length * BYTES_PER_SAMPLE)
    for (var i = 0; i < length; i++) {
      var index = i * BYTES_PER_SAMPLE
      var sample = buffer[i]
      if (sample > 1) {
        sample = 1
      } else if (sample < -1) {
        sample = -1
      }
      sample = sample * 32768
      data[index] = sample
      data[index + 1] = sample >> 8
    }
    recorded.push(data)
  }

  function dump (sampleRate) {
    var bufferLength = recorded.length ? recorded[0].length : 0
    var length = recorded.length * bufferLength
    var wav = new Uint8Array(44 + length)
    var view = new DataView(wav.buffer)

    // RIFF identifier 'RIFF'
    view.setUint32(0, 1380533830, false)
    // file length minus RIFF identifier length and file description length
    view.setUint32(4, 36 + length, true)
    // RIFF type 'WAVE'
    view.setUint32(8, 1463899717, false)
    // format chunk identifier 'fmt '
    view.setUint32(12, 1718449184, false)
    // format chunk length
    view.setUint32(16, 16, true)
    // sample format (raw)
    view.setUint16(20, 1, true)
    // channel count
    view.setUint16(22, 1, true)
    // sample rate
    view.setUint32(24, sampleRate, true)
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * BYTES_PER_SAMPLE, true)
    // block align (channel count * bytes per sample)
    view.setUint16(32, BYTES_PER_SAMPLE, true)
    // bits per sample
    view.setUint16(34, 8 * BYTES_PER_SAMPLE, true)
    // data chunk identifier 'data'
    view.setUint32(36, 1684108385, false)
    // data chunk length
    view.setUint32(40, length, true)

    for (var i = 0; i < recorded.length; i++) {
      wav.set(recorded[i], i * bufferLength + 44)
    }

    recorded = []
    postMessage(wav.buffer, [wav.buffer])
  }

  onmessage = function (e) {
    if (e.data[0] === 'encode') {
      encode(e.data[1])
    } else {
      dump(e.data[1])
    }
  }
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__libs_MicrophoneRecorder__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__libs_AudioPlayer__ = __webpack_require__(5);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ReactMic; });
var _jsxFileName = "/Users/aleksandramatiev/Documents/react-mic/src/components/ReactMic.js";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// cool blog article on how to do this: http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

// distortion curve for the waveshaper, thanks to Kevin Ennis
// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion





var ReactMic = function (_Component) {
  _inherits(ReactMic, _Component);

  function ReactMic(props) {
    _classCallCheck(this, ReactMic);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {
      microphoneRecorder: null
    };
    return _this;
  }

  ReactMic.prototype.componentDidMount = function componentDidMount() {
    var _props = this.props,
        onSave = _props.onSave,
        onStop = _props.onStop,
        onStart = _props.onStart,
        onData = _props.onData,
        audioElem = _props.audioElem,
        audioBitsPerSecond = _props.audioBitsPerSecond,
        mimeType = _props.mimeType;

    var options = {
      audioBitsPerSecond: audioBitsPerSecond,
      mimeType: mimeType
    };

    if (audioElem) {
      __WEBPACK_IMPORTED_MODULE_2__libs_AudioPlayer__["a" /* default */].create(audioElem);
    } else {
      this.setState({
        microphoneRecorder: new __WEBPACK_IMPORTED_MODULE_1__libs_MicrophoneRecorder__["a" /* default */](onStart, onStop, onSave, onData, options)
      });
    }
  };

  ReactMic.prototype.render = function render() {
    var _props2 = this.props,
        record = _props2.record,
        onStop = _props2.onStop,
        children = _props2.children;
    var microphoneRecorder = this.state.microphoneRecorder;


    if (microphoneRecorder) {
      if (record) {
        microphoneRecorder.startRecording();
      } else {
        microphoneRecorder.stopRecording(onStop);
      }
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.Fragment,
      {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 47
        },
        __self: this
      },
      children
    );
  };

  return ReactMic;
}(__WEBPACK_IMPORTED_MODULE_0_react__["Component"]);




ReactMic.defaultProps = {
  className: "record",
  audioBitsPerSecond: 128000,
  mimeType: "audio/webm;codecs=opus",
  record: false
};

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();

var AudioContext = {
  getAudioContext: function getAudioContext() {
    return audioCtx;
  },
  getAnalyser: function getAnalyser() {
    return analyser;
  }
};

/* harmony default export */ __webpack_exports__["a"] = AudioContext;

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AudioContext__ = __webpack_require__(4);


var audioSource = void 0;

var AudioPlayer = {
  create: function create(audioElem) {
    var audioCtx = __WEBPACK_IMPORTED_MODULE_0__AudioContext__["a" /* default */].getAudioContext();
    var analyser = __WEBPACK_IMPORTED_MODULE_0__AudioContext__["a" /* default */].getAnalyser();

    if (audioSource === undefined) {
      var source = audioCtx.createMediaElementSource(audioElem);
      source.connect(analyser);
      audioSource = source;
    }

    analyser.connect(audioCtx.destination);
  }
};

/* harmony default export */ __webpack_exports__["a"] = AudioPlayer;

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_audio_recorder_polyfill__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_audio_recorder_polyfill___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_audio_recorder_polyfill__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MicrophoneRecorder; });
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
        mediaRecorder = new __WEBPACK_IMPORTED_MODULE_0_audio_recorder_polyfill___default.a(str);
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



/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});