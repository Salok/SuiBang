//Variables globales
var cnv;
var pintor;
var width;
var height;

//Variables globales secundarias
var tick_interval;

//TitleScreen
//Esta es la pantalla inicial.
//Como todas las pantallas contiene una función para dibujarse y otra para actualizarse
var TitleScreen = {
	draw: function title_screen_draw() {
		pintor.clearRect(0, 0, width, height);

		pintor.fillStyle = "#f00";
		pintor.fillRect(20, 20, 20, 20);
	}
};

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
	}

	function pop() {
		screen_stack.pop();
	}

	function draw() {
		var top = get_top();
		if(top) {
			top.draw && top.draw();
		}
	}

	function update(dt) {
		var top = get_top();
		if(top) {
			top.update && top.update(dt);
		}
	}

	return {
		push: push,
		pop: pop,
		draw: draw,
		update: update
	}
})();

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
	ScreenManager.push(TitleScreen);
}

//start() es llamada automáticamente al cargar la página
function start() {
	cnv = document.getElementById('canvas');
	width = cnv.width;
	height = cnv.height;
	pintor = cnv.getContext('2d');

	prepare();
	tick_interval = setInterval(tick.bind(tick, 1/30), 1000/30);
}

window.onload = start;
