import React from 'react';

class WaitingList extends React.Component {
  state = {name: ""}

  update = (e) => {
    this.setState({
      name: e.target.value
    });
  }

  add = ()=>{
    this.props.addPlayer(this.state.name)
  }

  render(){ return this.props.list.map( (player)=> {
    return (
    <div className="WaitingPlayer">
      {player.name} <span className="Health">{player.health}</span>
    </div> );
  } ); }
}

export default WaitingList;
