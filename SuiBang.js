//__extends sirve para imitar la herencia dentro de JS
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

//Variables globales
var cnv;
var pintor;
var width;
var height;

//Variables globales secundarias
var tick_interval;

//Screen
//Clase que comparten todas las pantallas
function Screen(args) {
	this.needs_drawing = true;
	this.draw = args.draw;
	this.update = args.update;
	this.click = args.click;
}

//ScreenManager
//Se encarga de mantener la pila de pantallas
//Funciones:
// ScreenManager.push(screen)
//	Pone la pantalla screen encima de todas las demás
// ScreenManager.pop()
//	Quita la pantalla de encima
// ScreenManager.draw()
//	Delega en la pantalla de arriba para que se dibuje
// ScreenManager.update(dt)
//	Delega en la pantalla de arriba para que se actualice
var ScreenManager = (function () {
	var screen_stack = [];

	function get_top() {
		var stack_size = screen_stack.length;
		if(stack_size > 0) {
			return screen_stack[stack_size-1];
		} else {
			return undefined;
		}
	}

	function push(screen) {
		screen_stack.push(screen);
		screen.needs_drawing = true;
	}

	function pop() {
		screen_stack.pop();

		var top = get_top();
		if(top) {
			top.needs_drawing = true;
		}
	}

	function draw() {
		var top = get_top();
		if(top) {
			if(top.draw && top.needs_drawing) {
				top.draw();
				top.needs_drawing = false;
			}
		}
	}

	function update(dt) {
		var top = get_top();
		if(top) {
			top.update && top.update(dt);
		}
	}

	function click(event) {
		var top = get_top();
		if(top) {
			top.click && top.click(event);
		}
	}

	return {
		push: push,
		pop: pop,
		draw: draw,
		update: update,
		click: click
	};
})();

function GUIElem(args) {
	this.x = args.x;
	this.y = args.y;

	this.width = args.width;
	this.height = args.height;

	this.x1 = args.x;
	this.x2 = args.x + args.width;
	this.y1 = args.y;
	this.y2 = args.y + args.height;

	this.update = args.update;
	this.data = args.data || {};
}

__extends(GUIRect, GUIElem);
function GUIRect(args) {
	GUIElem.call(this, args);
	this.color = args.color || 'rgba(255, 255, 255, 0)';
}
GUIRect.prototype.draw = function GUIRect_draw() {
	pintor.fillStyle = this.color;
	pintor.fillRect(this.x, this.y, this.width, this.height);
};

__extends(GUILabel, GUIRect);
function GUILabel(args) {
	this.text_color = args.text_color || '#000';
	this.text = args.text;
	this.font = args.font || '12px sans-serif';
	GUIRect.call(this, args);
}
GUILabel.prototype.draw = function GUILabel_draw() {
	GUIRect.prototype.draw.call(this);

	pintor.textBaseline = 'middle';
	pintor.fillStyle = this.text_color;
	pintor.font = this.font;
	var measure = pintor.measureText(this.text);
	pintor.fillText(this.text, this.x + this.width/2 - measure.width/2, this.y + this.height/2);
};

__extends(GUIButton, GUILabel);
function GUIButton(args) {
	this.click = args.click;
	GUILabel.call(this, args);
}

__extends(GUIScreen, Screen);
function GUIScreen(){
	this.needs_drawing = true;
	this.subs = {};
}
GUIScreen.prototype.draw = function GUIScreen_draw() {
	pintor.clearRect(0, 0, width, height);
	this.forEach(function (sub) {
		sub.draw && sub.draw();
	});
};
GUIScreen.prototype.update = function GUIScreen_update(dt) {
	this.forEach(function (sub) {
		sub.update && sub.update(dt);
	});
};
GUIScreen.prototype.click = function GUIScreen_click(event) {
	var x = event.clientX,
		y = event.clientY;

	this.forEach(function (cs) {
		if(cs.click && cs.x1 < x && x < cs.x2 && cs.y1 < y && y < cs.y2) {
			cs.click(event);
		}
	});
}
GUIScreen.prototype.add = function GUIScreen_add(name, sub) {
	this.subs[name] = sub;
	sub.screen = this;
	this.needs_drawing = true;
	return this;
}
GUIScreen.prototype.forEach = function GUIScreen_forEach(fcn) {
	var sub;
	var sub_names = Object.keys(this.subs);
	sub_names.forEach(function (sub_name) {
		sub = this.subs[sub_name];
		fcn(sub, sub_name);
	}, this)
};

//tick()
//Llamada multitud de veces por segundo
//dt -> Tiempo entre llamadas en segundos
function tick(dt) {
	ScreenManager.update(dt);
	ScreenManager.draw();
}

//prepare()
//Es llamada una sola vez al empezar
//Colocar código para inicializar pantallas y demás aquí
function prepare() {
	//TitleScreen
	//Esta es la pantalla inicial.
	var TitleScreen = new GUIScreen();
	TitleScreen.add('backRect', new GUIRect({
		x: 0,
		y: 0,
		width: width,
		height: height,
		color: '#f00',
		data: {
			t: 0
		},
		update: function backRect_update(dt) {
			this.data.t = this.data.t + dt;
			var t = this.data.t;
			var r = Math.floor(255*(Math.sin(t)+1)/2),
				g = Math.floor(255*(Math.sin(t + Math.PI/2)+1)/2),
				b = Math.floor(255*(Math.sin(t + Math.PI)+1)/2);

			this.color = 'rgb(' + r + ',' + g + ',' + b + ')';
			this.screen.needs_drawing = true;
		}
	}))
		.add('titleLbl', new GUILabel({
		text: 'SuiBang',
			x: width/2 - 100,
			y: height/2 - 20 - 100,
			width: 200,
			height: 40,
			font: 'bold 80px Monospace'
	}))
		.add('initBtn', new GUIButton({
			text: 'Iniciar',
			x: width/2 - 100,
			y: height/2 - 20,
			width: 200,
			height: 40,
			font: '20px Monospace',
			click: function () {
				ScreenManager.push(SelectAceleratorScreen);
			}
	}));

	var SelectAceleratorScreen = new GUIScreen();
	SelectAceleratorScreen.add('AceleradoresLbl', new GUILabel({
		text: 'Aceleradores',
		x: width/2 - 100,
		y: height/2 - 20 - 150,
		width: 200,
		height: 40,
		font: '40px Monospace'
	}));

	ScreenManager.push(TitleScreen);
}

//start() es llamada automáticamente al cargar la página
function start() {
	cnv = document.getElementById('canvas');
	cnv.width = document.body.clientWidth;
	cnv.height = document.body.clientHeight;
	width = cnv.width;
	height = cnv.height;
	pintor = cnv.getContext('2d');

	cnv.addEventListener('click', ScreenManager.click);
	prepare();
	tick_interval = setInterval(tick.bind(tick, 1/30), 1000/30);
}

window.onload = start;
