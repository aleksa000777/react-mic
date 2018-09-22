# react-mic
[Original](https://github.com/hackingbeauty/react-mic)

Works via the HTML5 MediaRecorder API ([MediaRecorder](https://caniuse.com/#search=MediaRecorder)).

## Installation

`npm install --save react-mic`

## Features

- Record audio from microphone
- Display sound wave as voice is being recorded // TODO
- Save audio as BLOB

## Usage

```js

<ReactMic
  record={boolean}         // defaults -> false.  Set to true to begin recording
  className={string}       // provide css class name
  onStop={function}        // callback to execute when audio stops recording
  onData={function}        // callback to execute when chunk of audio data is available
  strokeColor={string}     // sound wave color
  backgroundColor={string} // background color
/>

```

## Example

```js
import { ReactMic } from 'react-mic';

export class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: false
    }

  }

  startRecording = () => {
    this.setState({
      record: true
    });
  }

  stopRecording = () => {
    this.setState({
      record: false
    });
  }

  onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  onStop(recordedBlob) {
    console.log('recordedBlob is: ', recordedBlob);
  }

  render() {
    return (
      <div>
        <ReactMic
          record={this.state.record}
          className="sound-wave"
          onStop={this.onStop}
          onData={this.onData}
          strokeColor="#000000"
          backgroundColor="#FF4081">
          <button onTouchTap={this.startRecording} type="button">Start</button>
          <button onTouchTap={this.stopRecording} type="button">Stop</button>
        </ReactMic>
      </div>
    );
  }
}
```
# Having issues with the lambda function?
Try installing babel-preset-stage-1

Include stage-1 in your webpack.config under presets.

e.g.

```js
module.exports = {
    entry: "./scripts/Main.js",
    output: {
        path: __dirname,
        filename: "./static/script.js"
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: "style!css"
        }, {
            test: /\.js$/,
            // exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react', 'stage-1']
            }
        }]

    }
};
```

## License

MIT
