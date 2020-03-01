// Octave # 	MIDI Note Numbers
			// C 	C# 	D 	D# 	E 	F 	F# 	G 	G# 	A 	A# 	B
// −1 			0 	1 	2 	3 	4 	5 	6 	7 	8 	9 	10 	11
// 0 			12 	13 	14 	15 	16 	17 	18 	19 	20 	21 	22 	23
// 1 			24 	25 	26 	27 	28 	29 	30 	31 	32 	33 	34 	35
// 2 			36 	37 	38 	39 	40 	41 	42 	43 	44 	45 	46 	47
// 3 			48 	49 	50 	51 	52 	53 	54 	55 	56 	57 	58 	59
// 4 			60 	61 	62 	63 	64 	65 	66 	67 	68 	69 	70 	71
// 5 			72 	73 	74 	75 	76 	77 	78 	79 	80 	81 	82 	83
// 6 			84 	85 	86 	87 	88 	89 	90 	91 	92 	93 	94 	95
// 7 			96 	97 	98 	99 	100 	101 	102 	103 	104 	105 	106 	107
// 8 			108 	109 	110 	111 	112 	113 	114 	115 	116 	117 	118 	119
// 9 			120 	121 	122 	123 	124 	125 	126 	127 	  	  	  	 


class midiKeyboard{
	constructor (midi){
		this.keys = document.querySelectorAll(".key");
		this.octBtns = document.querySelectorAll(".btn");
		this.midi = midi;

		this.currentOctave = 3;
		this.defaultLowC = 3; // default midi notes: 48 - 64 (C3-E4)

		// this.keys.forEach(key => key.addEventListener("transitionend", this.removeTransition));
		this.octBtns.forEach(btn => btn.addEventListener("transitionend", this.removeTransition));

		// Key and Character Codes
		// https://www.w3.org/2002/09/tests/keys.html
		window.addEventListener("keydown", this.playNote.bind(this));
		window.addEventListener("keyup", this.releaseNote.bind(this));

		// window.addEventListener("keydown", this.playNote.bind(this));

		// this.keys.forEach(key => key.addEventListener("click", this.playNote));
		// this.octBtns.forEach(btn => btn.addEventListener("click", this.changeOctave));
		
	}

	changeOctave(key){
		console.log("Octave key",key);

		var sign = key.getAttribute("data-note");

		if (sign === "+"){
			if (this.currentOctave<8) this.currentOctave++;
			// console.log("currentOctave",this.currentOctave);
		}
		else if (sign === "-"){
			if (this.currentOctave>-1) this.currentOctave--;
		}
		console.log("currentOctave",this.currentOctave);

		// to current notes after octave transform
		// note = base_note + (12*octave) if octave is between 0--10 and not -1--9
		// note = base_note + (12*(octave+1)) if octave is between -1--9
	}
	

	removeTransition(e) {
		if (e.propertyName !== "transform") return;
		this.classList.remove("playing"); // it should be the internat context of the btn
	}

	releaseNote(e){

		console.log("release");
		var key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
		if (!key){
			return;
		}
		else{

			const keyNote = key.getAttribute("data-midi");
			// const keyNote = key.getAttribute("data-note");

			console.log("keyNote ",parseInt(keyNote));

			if (key.classList.contains("playing")) key.classList.remove("playing");

			// var delay = 0; // play one note every quarter second
			var base_note = parseInt(keyNote); // the MIDI base note

			var note = base_note + (12*(this.currentOctave+1)) //if octave is between -1--9

			var delay = 0;
			var velocity = 127; // how hard the note hits
			// MIDI.setVolume(0, 127);   
			// MIDI.noteOn(0, note, velocity, delay);
			// MIDI.noteOff(0, note, delay + 0.08);
			
			this.midi.getMIDIMessage([128,note,0])

		}
	}


	playNote(e) {
		console.log("Screen piano playNote")
		// const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
		var key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

		// console.log("key", key);
		// if (!key) return;
		if (!key){
			// console.log("Not a note key", key);
			key = document.querySelector(`.btn[data-key="${e.keyCode}"]`);
			// console.log("key", key);
			if (!key){
				return;
			}

			key.classList.add("playing");
			this.changeOctave(key);


		}
		else{
			// default midi notes: 48 - 64 

			const keyNote = key.getAttribute("data-midi");
			// const keyNote = key.getAttribute("data-note");

			console.log("keyNote ",parseInt(keyNote));

			if (!key.classList.contains("playing")) key.classList.add("playing");

			var delay = 0; // play one note every quarter second
			var base_note = parseInt(keyNote); // the MIDI base note

			var note = base_note + (12*(this.currentOctave+1)) //if octave is between -1--9

			var velocity = 127; // how hard the note hits
			// MIDI.setVolume(0, 127);   
			// MIDI.noteOn(0, note, velocity, delay);
			// MIDI.noteOff(0, note, delay + 0.08);
			
			this.midi.getMIDIMessage([144,note,127]);

			// visualize note off
			// setTimeout(()=>{this.midi.getMIDIMessage([128,note,0])},100);
		}

	}

}