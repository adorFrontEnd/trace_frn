import React from 'react'
import { getAllPromptSound } from '../../api/setting/setting';

export default class AudioPlay extends React.Component {
  state = {
    audioList: null
  };

  componentDidMount() {

    this.getAllPromptSound();
  }

  componentWillReceiveProps(props) {
    if (props.audioCode && props.updateTime && props.updateTime != this.props.updateTime) {
      this.playAudio(props.audioCode);
    }
  }

  playAudio = (code) => {
    if (!code) {
      return;
    }
    let domId = "__audioId" + code;

    let dom = document.getElementById(domId);
    if (dom) {

      console.log('----------date:' + new Date() + "---------------------");
      console.log('playAudio:' + code)
      dom.play();
    }
  }

  getAllPromptSound = () => {

    if (this.state.audioList) {
      return;
    }

    getAllPromptSound()
      .then((data => {
        let audioList = data.filter(item => item.status == 1);
        this.setState({
          audioList
        })
      }))
  }


  render() {

    return (
      <div style={{ display: "block" }}>
        {
          this.state.audioList && this.state.audioList.length ?
            this.state.audioList.map(item =>

              <audio key={item.id} src={item.url} id={'__audioId' + item.code}></audio>
            )
            : null
        }
      </div>
    )
  }
}

