/*

  CannonFudderJS

  (c) 2019 Sebastian Glaser
  (c) 2019 DCI Digital Career Institute

    Source-Code licensed under
                   GNU GPL 3.0 (https://www.gnu.org/licenses/gpl-3.0.en.html)
               and GNU FDL 1.0 (https://www.gnu.org/licenses/fdl-1.3.en.html)

    Artwork licensed under
                   CC-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)

  ReactJS example t  lessPower = ()=> {
    if ( this.state.controlsBlocked ) return;
    if ( ! this.state.currentPlayer ) return;
    let temp = this.state.currentPlayer;
    temp.power -= 5;
    this.setState({currentPlayer:temp});
  }o illustrate various aspects of using react in the wild.

  This is based on the videogame classic 'Artillery Simulator' in which players get cannon towers,
  randomly placed on a 2d terrain. The objective is to hit each other, going in turns,
  until only one player is left.

    https://en.wikipedia.org/wiki/Artillery_game

  TEACHERS NOTE: this is intended as the full solution to the task.
    - Usually you would remove a component or function and give students the task to fill in.
    - For more advanced students the whole application can be re-created just using the assets,
      with the complete application as a reference on how it should behave.

  Unusual for code, but in the sense of open education
    this project is released under GNU FDL,
    and GNU GPLv3.

*/

import './App.css';
import logo        from './logo.svg';
import React       from 'react';

/*
  As with any good react application we structure our code
  into reusable components. Our entry point needs to import them.
*/

import Controls    from './controls.js'    // the part responsible
import AddPlayer   from './addPlayer.js'
import Waiting     from './waitingList.js'
import Battlefield from './battlefield.js'
import ErrorBox    from './errorBox.js'

/*
  This function helps us get a random element from an Array.
    NOTE: it is generally not recommended to extend the array prototype
*/

Array.prototype.random = function (){
  return this[Math.floor(Math.random()*this.length)];
}

/*
  Some elementary constants
    r not mutate state directly. Use setState()                  react/no-direct-mutation-state
  Line 123:5:  Do not mutate state directly. Use setState()                  react/no-direct-mutation-state
  Line 130:5:  Do not mutate state directly. Use setState()                  react/no-direct-mutation-state
  Line 137:5:  Do not mutate state directly. Use setState()   elevant for the simulation of the projectile's flight
    and working with angles
*/

const GRAV = 9.81;          // approximation to the earth's gravity
const RAD  = Math.PI / 180; // radian conversion ratio (degrees to radians, 360 degrees = TAU = 2 * PI)
Math.TAU = 2 * Math.PI;     // This fundamental constant is missing from javascript :D

class App extends React.Component {

  state = {
    player:          [],   // this array is where we keep all the player's states
    currentPlayer:   null, // a reference to the player whose turn it currently is
    controlsBlocked: true, // blocks player input if a projectile is flying or setting are opened
    showSettings:    true  // wther or not the Settings should be shown
  }

  /*
    This function creates a new player and inserts him into the list of players.
    If there is no currentPlayer, this new player will be used as currentPlayer.
  */

  addPlayer = (name)=> {
    // create a new anonymous object representing the player with some default values
    let newPlayer = {
      name:name,
      health:100,
      points:0,
      angle:45,
      power:100
    };
    // in addition
    Object.assign(
      newPlayer,
      this.getStartingPosition()
    );
    // now push the newly created player to the end of the players array
    this.state.player.push( newPlayer );
    // using the boolean OR operator we check if a currentPlayer is already set
    //   if not the new player will be set
    //   this works because {this.state.currentPlayer} will evaluate to null
    //   in wich case lazy evaluation will continue with the expression
    //   and newPlayerwill be chosen.
    this.setState({
      currentPlayer: this.state.currentPlayer || newPlayer
    });
  }

  /*
    The following functions modify the player objects
  */

  turnLeft = ()=> {
    if ( this.state.controlsBlocked ) return;
    if ( ! this.state.currentPlayer ) return;
    let temp = this.state.currentPlayer;
    temp.angle -= 5;
    this.setState({
      currentPlayer:this.state.currentPlayer
    });
  }

  turnRight = ()=> {
    if ( this.state.controlsBlocked ) return;
    if ( ! this.state.currentPlayer ) return;
    let temp = this.state.currentPlayer;
    temp.angle += 5;
    this.setState({currentPlayer:temp});
  }

  lessPower = ()=> {
    if ( this.state.controlsBlocked ) return;
    if ( ! this.state.currentPlayer ) return;
    let temp = this.state.currentPlayer;
    temp.power -= 5;
    this.setState({currentPlayer:temp});
  }

  morePower = ()=> {
    if ( this.state.controlsBlocked ) return;
    if ( ! this.state.currentPlayer ) return;
    let temp = this.state.currentPlayer;
    temp.power += 5;
    this.setState({currentPlayer:temp});
  }

  /*
    This is the simulation part.
    Because one can't tell (actually on could)
  */

  fire = async ()=> {
    // check error conditions
    if ( this.state.controlsBlocked ) return;
    if ( ! this.state.currentPlayer ) return;
    // block all controls
    this.setState({controlsBlocked:true});
    // set intitial postion time etc.
    let time = 0;
    let player = this.state.currentPlayer;
    let angleCorrected = ( 360 + 360 - player.angle ) % 360;
    let startX = player.x + Math.cos(angleCorrected*RAD) * 6;
    let startY = player.y - Math.sin(angleCorrected*RAD) * 6;
    let cannonball = {
      x: startX,
      y: startY
    }

    await new Promise( (resolve)=> {
      let timer = setInterval( () => {
        time += 0.066;
        cannonball.x = startX + ( player.power * time * Math.cos( player.angle * RAD ));
        cannonball.y = startY + ( player.power * time * Math.sin( player.angle * RAD )) - ( GRAV * Math.pow(time,2) / 2);
        requestAnimationFrame( ()=>{
          if ( this.paintStage(cannonball) ){
            this.state.player.forEach( (player) => {
              let distanceX = Math.abs( player.x - cannonball.x );
              let distanceY = Math.abs( player.y - cannonball.y );
              let distance  = Math.sqrt( distanceX**2 + distanceY**2 );
              if ( distance < 20 ){
                player.health = Math.floor( player.health - ( 20 - distance ));
              }
            });
            clearTimeout(timer);
            resolve();
          }
        });
      }, 16);
    });
    this.setState({controlsBlocked:false});
    this.nextPlayer();
  }

  nextPlayer = () => {
    let list = this.state.player;
    let nextIdx = ( list.indexOf(this.state.currentPlayer) + 1 ) % list.length;
    let player = list[nextIdx];
    this.setState({currentPlayer:player});
  }

  flashError = async (msg="Unknown Error") => {
    this.setState({errorMessage:msg});
    await new Promise( (resolve)=> { setTimeout(resolve,2000) });
    this.setState({errorMessage:null});
  }

  startGame = () => {
    if ( this.state.player.length < 2 ){
      this.flashError("This will be boring. Add at least 2 players.");
      return;
    }
    this.setState({
      showSettings:false,
      controlsBlocked:false
    });
  }

  componentDidUpdate = () => {
    this.paintStage(false)
  }

  render(){
    window.App = this;
    let current = this.state.currentPlayer;
    let others = this.state.player.filter( (player) => { return player !== current });
    let playerNames = this.state.player.map( (player) => { return player.name } );
    return (
      <div className="App">
        <div className="Header"></div>
        { this.state.errorMessage ? <ErrorBox message={this.state.errorMessage} /> : null }
        <Controls
          player={this.state.currentPlayer}
          turnLeft={this.turnLeft}
          turnRight={this.turnRight}
          lessPower={this.lessPower}
          morePower={this.morePower}
          fire={this.fire}
        />
        <div className="WaitingPlayers">
          <Waiting list={others} />
        </div>
        { this.state.showSettings ?
          <div className="Settings">
            <img src={logo} className="App-logo" alt="logo" />
            <AddPlayer addPlayer={this.addPlayer} playerNames={playerNames} controller={this}/>
            <button className="start center-relative-h" onClick={this.startGame}>Start Game</button>
          </div>
        : null }
        <Battlefield controller={this}/>
      </div>
    );
  }
}

export default App;
