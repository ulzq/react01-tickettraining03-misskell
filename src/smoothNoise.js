// SmoothNoise script
// ver: 0.1
// markusT inkfood.com
// https://github.com/inkfood/smoothNoiseJS/blob/master/lib/smoothNoise.js

function Random(seed) {
  this._seed = seed % 2147483647;
  if (this._seed <= 0) this._seed += 2147483646;
}

Random.prototype.next = function () {
  return this._seed = this._seed * 16807 % 2147483647;
};

Random.prototype.nextFloat = function (opt_minOrMax, opt_max) {
  return (this.next() - 1) / 2147483646;
};

var smoothNoise = function ()
{
    this.frequency = 10;
    this.subDivision = 10;
    this.highLimit = 300;
    this.lowLimit = 500;
    this.lastPos = {x:0,y:0};
    this.points = [];
    this.width = window.innerWidth;
}

smoothNoise.prototype.fill = function()
{
    var points = [];

    this.lastPos = {x:this.lastPos.x,y:randomNumber(this.lowLimit,this.highLimit)};

    //PRE DEFINED POINTS
    if(this.points.length > 0)
    {
        this.lastPos = {x:0,y:this.points[0][1]}
        for (let i = 0; i < this.frequency; i++)
        {
            let subPoints = this.add(null,this.points[i][1]);

            for (let j = 0; j < subPoints.length; j++)
            {
                    points.push(subPoints[j])
            }
        }
    }
    //DYNAMIC POINTS
    else
    {

        for (var i = 0; i < this.frequency; i++)
        {
            var subPoints = this.add();

            for (var j = 0; j < subPoints.length; j++)
            {
                points.push(subPoints[j])
            }
        }

    }

    return points;
}

smoothNoise.prototype.add = function(nextX,nextY)
{   let x,y;
    if(nextX){x = nextX}//PRE DEFINED POINTS
    else {x = (this.lastPos.x + (this.width/(this.frequency)));}//DYNAMIC POINTS

    if(nextY){y = nextY}//PRE DEFINED POINTS
    else {y = randomNumber(this.lowLimit,this.highLimit);}//DYNAMIC POINTS


    let subPoints = [];

    for (var i = 0; i < this.subDivision; i++)
    {
        var t = i/this.subDivision;

        var sub_x = (((x-this.lastPos.x)/this.subDivision)*(i))+this.lastPos.x;

        var sub_y = Cosine_Interpolate(this.lastPos.y, y, t);

        subPoints.push({x:sub_x,y:sub_y})
    }

    this.lastPos = {x:x,y:y};

    return subPoints;
}

function randomNumber(min,max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Cosine_Interpolate(a, b, x)
{
	var ft = x * 3.1415927 //MATH PI
	var f = (1 - Math.cos(ft)) * .5

	return  a*(1-f) + b*f
}

export default smoothNoise;
