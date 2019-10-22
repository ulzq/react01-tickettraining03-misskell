import React from 'react';

class powerLimit extends React.Component {
  render(){
    return (
      <div className="powerLimit">
        {this.props.message}
      </div> );
  }
}

export default powerLimit;
