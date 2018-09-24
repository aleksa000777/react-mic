"use strict";

exports.__esModule = true;
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

exports.default = AudioContext;
module.exports = exports["default"];