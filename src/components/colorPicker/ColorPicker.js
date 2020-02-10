import React from 'react'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'
import './picker.less'

class SketchExample extends React.Component {
  state = {
    displayColorPicker: false,
    color: {hex:"#ffffff" },
  };

  componentWillReceiveProps(props){
    if(props.color && props.color.hex){
      let color = props.color;
      this.setState({
        color
      })
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {  
   
    this.props.onChange(color);
    this.setState({ color: color.hex })
  };

  render() {

    const styles = reactCSS({
      'default': {
        color: {
          width: '24px',
          height: '20px',
          borderRadius: '2px',
          border:'1px solid #ccc',
          background: `${this.state.color.hex}`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',        
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div>
        <div style={ styles.swatch } onClick={ this.handleClick }>
          <div style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } />
        </div> : null }

      </div>
    )
  }
}

export default SketchExample