var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var WIDTH = canvas.width;
var HEIGHT = canvas.height;
var animation = undefined;		// flag if animation is running

var motionTrailLength = 177;

var bodies = [];			// all bodies
var checkedBodies = [];		// chosen bodies

var space = new Image();
var img = new Image();
var dt = 43200;				// simulation step = 1 day = 24 hours
var G  = 6.67408e-11;
var max = 2.5e11;

var scale = (WIDTH*0.6)/(2*Math.abs(max));		// scaling

function Point(x, y)
{
	this.x = x;
	this.y = y;
};

function rescaleX(x)
{
	return x*scale + WIDTH/2;
}

function rescaleY(y)
{
	return HEIGHT/2 - y*scale;;
}

function Body(name, diameter, mass, position, velocity)
{
	this.name = name;
	this.diameter = diameter;
	this.m = mass;
	this.r = position;
	this.r_start = new Point(position.x, position.y);
	this.v = velocity;
	this.v_start = new Point(velocity.x, velocity.y);
	this.positions = [];
};

Body.prototype.storeLastPosition = function() 
{
	// push an item
	var p = new Point(this.r.x, this.r.y);
	this.positions.push(p);

	//get rid of first item
	if (this.positions.length > motionTrailLength) {
	this.positions.shift();
	}
};

Body.prototype.motionTrailDraw = function() 
{
	for (var i = 0; i < this.positions.length; i++) 
	{
		var ratio = (i + 1) / this.positions.length; 

		var x = this.positions[i].x*scale + WIDTH/2;
		var y = HEIGHT/2 - this.positions[i].y*scale;

		ctx.beginPath();
		ctx.arc(x, y, 0.65, 0, 2 * Math.PI, true);
		ctx.fillStyle ="rgba(255, 255, 255, " + 1 + ")";;
		ctx.fill();
	}
};

Body.prototype.drawEllipse = function(M) {
	var r  = this.r_start.x;
	var v = this.v_start.y;
	var p = this.m*v*r;
	var E = this.m*v*v/2 - G*M*this.m/r;
	var a = -G*M*this.m/(2*E);
	var b = Math.sqrt(-p*p/(2*E*this.m));

	var y = rescaleY(0);
	var x = rescaleX(r-a);
	//if(this.name=='earth') document.getElementById("debug").innerHTML += "p = "+p+", a = "+a+", b = "+b+", r = "+r+", E = "+E+", v = "+v+", m = "+this.m;
	a = scale*a;
	b = scale*b;
	r = r*scale;

	ctx.beginPath();
	ctx.ellipse(x, y, a, b, 0, 0, Math.PI*2);
	//ctx.arc(WIDTH/2, HEIGHT/2, r, 0, Math.PI*2, true);
	//ctx.fill();
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = '#e6e6e6';
	ctx.stroke();
};

// return a copy of an Array
Array.prototype.clone = function() {
	return this.slice(0);
};


function add(fromArray, toArray, name)
{
	for(var i = 0; i < fromArray.length; i++)
	{
		if(fromArray[i].name==name)
		{
			break;
		}
	}
	toArray.push(fromArray[i]);
}

function remove(array, name)
{
	for(var i = 0; i < array.length; i++)
	{
		if(array[i].name==name)
		{
			array.splice(i,1);
			break;
		}
	}
}

function circle(x,y,r) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI*2, true);
	ctx.fill();
}

function rect(x,y,w,h) {
	ctx.fillRect(x,y,w,h);
}

function clear() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function init() {
	bodies.push(new Body("sun",70, 1.989e30,new Point(0.,0.), new Point(0.,0.)) );
	checkedBodies.push(new Body("sun",70, 1.989e30,new Point(0.,0.), new Point(0.,0.)) );
	bodies.push(new Body("mercury",15, 0.330e24,new Point(0.698e11,0.), new Point(0.,-38860)) );
	bodies.push(new Body("venus",23, 4.867e24,new Point(1.089e11,0.), new Point(0.,-34790)) );
	bodies.push(new Body("earth",25, 5.972e24,new Point(1.521e11,0.), new Point(0.,-29290)) );
	bodies.push(new Body("mars",15, 0.642e24,new Point(2.492e11,0.), new Point(0.,-21970)) );
	//bodies.push(new Body("halley",10, 2.2e14,new Point(2.492e11,0.), new Point(0.,-21970)));
	space.src = 'space2.jpg'
	ctx.drawImage(space, 0, 0, WIDTH, HEIGHT);

	// unchecking all checkboxes at the beginning and on reset
	checkAll(false);
}

function checkAll(action)
{
	var planets = document.getElementsByName('planets');
	for (var i = 0; i < planets.length; i++) {
		planets[i].checked = action;
     }
}

function start()
{
	if(!animation)
	{
		animation = window.requestAnimationFrame(draw);
	}
	//return setInterval(draw, 20);
}

function stop()
{
	window.cancelAnimationFrame(animation);
	animation = undefined;
}

function reset()
{
	stop();
	checkedBodies = [];
	bodies = [];
	init();
}


function draw() 
{
	animation = undefined;
	clear();
	ctx.drawImage(space, 0, 0, WIDTH, HEIGHT);
	
	img.src = checkedBodies[0].name+".png";
	var d = checkedBodies[0].diameter;
	ctx.drawImage(img, WIDTH/2-d/2, HEIGHT/2-d/2, d, d);

	for (var i = 1; i < checkedBodies.length; i++) 
	{
		if(checkedBodies[i].name=="mercury")
		{
			checkedBodies[i].storeLastPosition();
			checkedBodies[i].motionTrailDraw();
		}
		else checkedBodies[i].drawEllipse(checkedBodies[0].m);

		var mod_r = Math.sqrt(checkedBodies[i].r.x*checkedBodies[i].r.x + checkedBodies[i].r.y*checkedBodies[i].r.y);
		var a = -G*checkedBodies[0].m/Math.pow(mod_r,3);
		checkedBodies[i].v.x = checkedBodies[i].v.x + a*checkedBodies[i].r.x*dt;
		checkedBodies[i].v.y = checkedBodies[i].v.y + a*checkedBodies[i].r.y*dt;
		checkedBodies[i].r.x = checkedBodies[i].r.x + checkedBodies[i].v.x*dt;
		checkedBodies[i].r.y = checkedBodies[i].r.y + checkedBodies[i].v.y*dt;

		x = rescaleX(checkedBodies[i].r.x);
		y = rescaleY(checkedBodies[i].r.y);	

		var img1 = new Image();
		img1.src = checkedBodies[i].name+".png";
		d = checkedBodies[i].diameter;
		ctx.drawImage(img1, x-d/2, y-d/2, d, d);

	}
	start();
}


// function debug()
// {
// 	var text = "Dla "+bodies[3].name+"\n";

// 	for (var i = 0; i < bodies[3].positions.length; i++) 
// 	{
// 		text += "["+i+"].x = "+ bodies[3].positions[i].x;
// 	}
// 	document.getElementById("debug").innerHTML = text; 
// }






$(document).ready(function() {
    $("#text1").click(function(){
        $("#choosing").slideToggle("slow");
    });
});



$('#choosing :checkbox').change(function() {
    var planets = document.getElementsByName('planets');
    if (this.checked) {
        if(this.value=="all") 
    	{
    		checkAll(true);
    		checkedBodies = bodies.clone();
    	}
        else 
        	{
        		var flag = true;
        		for (var i = 1; i < planets.length; i++) {
					if(planets[i].checked==false) flag = false;
			    }
			    if(flag==true) planets[0].checked = true;
        		add(bodies, checkedBodies, this.value);
        	}
    } 
    else 
    {
        if(this.value=="all")
        {
        	checkAll(false);
        	checkedBodies.splice(1);
        }
    	else 
    		{
				planets[0].checked = false;
    			remove(checkedBodies, this.value);
    		}
    }
});

$("canvas").mouseenter(stop);
$("canvas").mouseleave(start);
