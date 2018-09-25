import React, {Component}          from 'react';
import { render }                  from 'react-dom';

import ReactMic from '../../src';

require ('./styles.scss');

export default class Demo extends Component {
  constructor(props){
    super(props);
    this.state = {
      blobObject: null,
      isRecording: false,
      active: false
    }
  }

  startRecording= () => {
    this.setState({
      isRecording: true
    });
  }

  stopRecording= () => {
    this.setState({
      isRecording: false,
      active: false
    });
  }

  onSave = (blobObject) => {
  }

  onStart = () => {
    this.setState({
      active: true
    });
  }

  onStop = (blobObject) => {
    this.setState({
      blobURL : blobObject.blobURL
    });
    console.log("URL: ", blobObject.blobURL)
  }

  onData(recordedBlob){
    console.log('data: ', recordedBlob);
  }

  render() {
    const { isRecording } = this.state;
    return(
        <div>
          <h1>React-Mic</h1>
          <p><a href="https://github.com/hackingbeauty/react-mic">Documentation</a></p>
          <ReactMic
            record={isRecording}
            audioBitsPerSecond= {128000}
            onStop={this.onStop}
            onStart={this.onStart}
            onSave={this.onSave}
            onData={this.onData}>
            <audio
              src={this.state.blobURL}
              controls>
            </audio>
            <br />
            <br />
            <button onClick={this.startRecording} disabled={isRecording} type="button">
              Start
            </button>
            <button onClick={this.stopRecording} disabled={!isRecording} type="button">
              Stop
            </button>
          </ReactMic>
        </div>
    );
  }
}

render(<Demo/>, document.querySelector('#demo'))
