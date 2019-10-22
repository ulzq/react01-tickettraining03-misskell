import React from 'react';

class AddPlayer extends React.Component {
  state = {name:""};

  update = (e) => {
    this.setState({
      name: e.target.value
    });
  }

  add = ()=> {
    if ( this.state.name.trim() === "" ){
      this.props.controller.flashError("you forgot to put in a name");
      return; }
    if ( this.props.playerNames.includes(this.state.name) ){
      this.props.controller.flashError("WoOoHoOo!! Name is taken, try again plz!");
      return; }
    this.props.addPlayer(this.state.name)
    this.setState({name:""});
  }

  render(){
    return (
      <div className="AddPlayer">
        <input className="center-relative-h" id="name" onChange={this.update} value={this.state.name} />
        <button className="center-relative-h" onClick={this.add}>Add Player</button>
      </div> );
  }
}

export default AddPlayer;
