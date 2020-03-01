// https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3

// https://www.smashingmagazine.com/2018/03/web-midi-api/

// Pianos
// https://www.borjamorales.com/3d-piano-player/
// https://github.com/reality3d/3d-piano-player
// https://github.com/annaneo/pianoKeyboard
// https://codepen.io/gabrielcarol/pen/rGeEbY
// https://codepen.io/peteranglea/pen/KZrGxo
// https://github.com/annaneo/pianoKeyboard
// https://bundin.info/Open-Web-Piano/
// view-source:https://bundin.info/Open-Web-Piano/

// Fonts
// https://usefulangle.com/post/74/javascript-dynamic-font-loading
// https://www.malthemilthers.com/font-loading-strategy-acceptable-flash-of-invisible-text/
// https://www.pagecloud.com/blog/how-to-add-custom-fonts-to-any-website

// http://blog.cjgammon.com/pixijs-basic


// Create simple cat animation idea
// https://medium.com/dailyjs/how-to-build-a-simple-sprite-animation-in-javascript-b764644244aa
// https://jnordberg.github.io/gif.js/

class midiCanvas{

	constructor(midi, height, width){
		this.midi = midi;
		this.width = width;
		this.height = height;

		this.midiEventsBuffer;

		this.app = new PIXI.Application({
			width: this.width, 
			height: this.height, 
			// backgroundColor: 0x1099bb,
			// backgroundColor: 0x05386b,
			backgroundColor: 0x379683,
			autoResize: true,
			antialias: true,
			resolution: window.devicePixelRatio || 1,
		});

		document.getElementById("pixi_container").appendChild(this.app.view);

		this.t = 0;
		this.step = 1;

		// this.init();
	}

	init(){
		// this.container = new PIXI.Container();

		// this.app.stage.addChild(this.container);
		
		// Create a new texture
		// https://www.photopea.com
		const texture = PIXI.Texture.from('img/note.png');

		for (let i = 0; i < 1; i++) {
			this.noteImg = new PIXI.Sprite(texture);
			this.noteImg.anchor.set(0.5);

			this.noteImg.x = this.app.screen.width / 2;
			this.noteImg.y = this.app.screen.height / 2;

			this.app.stage.addChild(this.noteImg);

			// bunny.x = (i % 5) * 40;
			// bunny.y = Math.floor(i / 5) * 40;
			
			// this.container.addChild(bunny);

			// // / Move container to the center
			// this.container.x = this.app.screen.width / 2;
			// this.container.y = this.app.screen.height / 2;

			// // Center bunny sprite in local container coordinates
			// this.container.pivot.x = this.container.width / 2;
			// this.container.pivot.y = this.container.height / 2;

			

			// Create a graphic instance for the time cursor line
			this.graphics = new PIXI.Graphics();
			this.app.stage.addChild(this.graphics);

			// Create a graphic instance for the note lines
			this.noteLines = new PIXI.Graphics();
			this.app.stage.addChild(this.noteLines);

			// var t = 0;
			// var step = 1;

			// // Start the animation frame loop
			// this.app.ticker.add(this.refresh.bind(this));
		}
	}

	run(){
		// console.log("RUN")
		this.app.ticker.add(this.refresh.bind(this));
	}


	computeY(y){
		var in_min=0;
		var in_max=127;
		var out_min = this.app.screen.height;
		var out_max = 0;

		var newY = (y - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

		return newY;
	}

	refresh(delta){
		// console.log("delta",delta," this:",this);
		this.noteImg.rotation -= 0.01 * delta;

		var buffer = this.midi.progressTime();
		// console.log(delta);
		this.t = this.t+delta;
		

		// Progress time cursor
		this.graphics.clear();
		// this.graphics.lineStyle(3, 0x33FF00);
		this.graphics.lineStyle(4, 0x5cdb95);
		
		this.graphics.moveTo(this.t, 0);
		this.graphics.lineTo(this.t, 300);

		// Progress midi notes
		for (var i=0; i<buffer.length; i++ ){
			
			var note_history = buffer[i];
			var last_index = buffer[i].length-1;
			
			if (note_history[last_index]>0){
				
				// create line
				var newY = this.computeY(i);

				// this.noteLines.lineStyle(3, 0x33FF00);
				this.noteLines.lineStyle(3, 0x5cdb95);
				this.noteLines.moveTo(this.t, newY);
				this.noteLines.lineTo(this.t+this.step, newY);
				this.noteLines.closePath();

				// console.log("NOTE ON! Y:",newY," Midi note:",i ," Velocity:", note_history[last_index]);
			}

		}

		if (this.t>this.app.screen.width){
			this.t = 0;
			this.noteLines.clear();
		}
	}

}