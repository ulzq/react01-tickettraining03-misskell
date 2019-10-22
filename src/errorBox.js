import React from 'react';

class ErrorBox extends React.Component {
  render(){
    return (
      <div className="ErrorBox">
        {this.props.message}
      </div> );
  }
}

export default ErrorBox;
