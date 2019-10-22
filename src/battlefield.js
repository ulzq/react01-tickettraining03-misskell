import React from 'react';
import smoothNoise from './smoothNoise.js'

const RAD = Math.PI / 180;

class Battlefield extends React.Component {

  componentDidMount(){
    this.cnv = document.getElementById('stage');
    this.cnv.width = window.innerWidth;
    this.cnv.height = window.innerHeight;
    this.ctx = this.cnv.getContext('2d');
    this.createHeightMap();
    this.paintStage();
    this.cachedMap = new OffscreenCanvas( this.cnv.width, this.cnv.height );
    this.cachedCtx = this.cachedMap.getContext('2d');
    this.cachedCtx.drawImage(this.cnv,0,0);
  }

  createHeightMap = ()=> {
    this.noise = new smoothNoise();
    this.noise.frequency = 10;
    this.noise.subDivision = 10;
    this.noise.highLimit = window.innerHeight / 3;
    this.noise.lowLimit = 20;
    this.noise.lastPos = {x:0,y:0};
    this.noise.width = this.cnv.offsetWidth;
    this.map = this.noise.fill();
    this.props.controller.paintStage = this.paintStage;
    this.props.controller.getStartingPosition = () => {
      return this.map.random()
    }
  }

  paintStage = (cannonball=false) => {
    let width  = this.cnv.offsetWidth;
    let height = this.cnv.offsetHeight;
    let c = this.ctx;
    c.fillStyle = '#00f';
    c.fillRect(0,0,width,height);
    c.fillStyle = '#0f0';
    c.beginPath();
    c.moveTo(0, height);
    let last = null;
    this.map.forEach( (point) => {
      last = point;
      c.lineTo( point.x, height - point.y );
    })
    c.lineTo( width, height - last.y );
    c.lineTo(width,height);
    c.lineTo(0,height);
    c.closePath();
    c.fill();
    c.fillStyle = '#f00';
    c.strokeStyle = '#fff';
    this.props.controller.state.player.forEach( (player) => {
      c.beginPath();
      c.arc( player.x, height - player.y, 10, 0, 2 * Math.PI );
      c.fill();
      c.beginPath();
      c.moveTo( player.x, height - player.y );
      let angleCorrected = ( 360 + 360 - player.angle ) % 360;
      let linex = Math.cos(angleCorrected*RAD)*12;
      let liney = Math.sin(angleCorrected*RAD)*12;
      c.lineTo( player.x + linex, height - player.y + liney );
      c.stroke();
    });
    if ( cannonball ){
      c.fillStyle = '#FFF';
      c.beginPath();
      c.arc( cannonball.x, height - cannonball.y, 3, 0, 2 * Math.PI );
      c.fill();
      let rx = Math.round(cannonball.x);
      let ry = Math.round(cannonball.y);
      let px = this.cachedCtx.getImageData(rx,height-ry,1,1).data;
      if ( px[0] === 0 && px[1] === 255 && px[2] === 0 && px[3] === 255 ){
        return true;
      }
      if ( cannonball.x < 0 || cannonball.x > width || cannonball.y < 0 ){
        return true;
      }
    }
    return false;
  }

  render(){
    return (
      <div className="Battlefield">
        <canvas id="stage"/>
      </div>
    );
  }
}

export default Battlefield;
