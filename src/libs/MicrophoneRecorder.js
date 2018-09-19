import AudioContext from './AudioContext';
import MediaRecorder from 'audio-recorder-polyfill';

let analyser;
let audioCtx;
let mediaRecorder;
let chunks = [];
let startTime;
let stream;
let mediaOptions;
let blobObject;
let onStartCallback;
let onStopCallback;
let onSaveCallback;
let onDataCallback;

const constraints = { audio: true, video: false }; // constraints - only audio needed

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

export class MicrophoneRecorder {
  constructor(onStart, onStop, onSave, onData, options) {
    onStartCallback= onStart;
    onStopCallback= onStop;
    onSaveCallback = onSave;
    onDataCallback = onData;
    mediaOptions= options;
  }

  startRecording = () => {
    startTime = Date.now();

    if(mediaRecorder) {
      if(audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if(mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        return;
      }

      if(audioCtx && mediaRecorder && mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        if(onStartCallback) { onStartCallback() };
      }
    } else {
      analyser = null;
      audioCtx = null;
      chunks = [];
      stream = null;
      blobObject = null;
      mediaRecorder = null;

      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constraints)
          .then((str) => {
            stream = str;
            if(MediaRecorder.isTypeSupported(mediaOptions.mimeType)) {
              mediaRecorder = new MediaRecorder(str, mediaOptions);
            } else {
              mediaRecorder = new MediaRecorder(str);
            }

            if(onStartCallback) { onStartCallback() };
            mediaRecorder.addEventListener('stop', this.onStop)
            mediaRecorder.addEventListener('dataavailable', e => {
              console.log(e.data.type)
              chunks.push(e.data);
              if(onDataCallback) {
                onDataCallback(e.data);
              }
            })

            audioCtx = AudioContext.getAudioContext();
            analyser = AudioContext.getAnalyser();

            audioCtx.resume();
            mediaRecorder.start();

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
          });

      } else {
        alert('Your browser does not support audio recording');
      }
    }

  }

  stopRecording() {
    // if(mediaRecorder && mediaRecorder.state !== 'inactive') {
    if(mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(i => i.stop())
      stream.getAudioTracks().forEach((track) => {
        track.stop()
      })

      mediaRecorder = null
      audioCtx.suspend();
    }
  }

  onStop() {
    const blob = new Blob(chunks, { 'type' : mediaOptions.mimeType });
    chunks = [];

    const blobObject =  {
      blob      : blob,
      startTime : startTime,
      stopTime  : Date.now(),
      options   : mediaOptions,
      blobURL   : window.URL.createObjectURL(blob)
    }

    if(onStopCallback) { onStopCallback(blobObject) };
    if(onSaveCallback) { onSaveCallback(blobObject) };
  }

}
