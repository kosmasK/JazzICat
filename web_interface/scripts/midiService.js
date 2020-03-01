// https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3

// https://www.smashingmagazine.com/2018/03/web-midi-api/



// FOR TESTING LOCALLY
// Python server

// If you have Python installed, it should be enough to run this from a command line (from your working directory):
// //Python 2.x
// python -m SimpleHTTPServer

// //Python 3.x
// python -m http.server

// This will serve files from the current directory at localhost under port 8000, i.e in the address bar type:
// http://localhost:8000/


class midiService{

	constructor(history_size, mute_btn){

		this.historySize = history_size;

		this.midiAccess = 1;

		this.midiEventsBuffer = [];

		this.midiBuffer = [];

		this.currentNoteOn = [];
		this.currentNoteOff = [];

		this.mute_btn = mute_btn;

		for (var i=0; i<128; i++){
			var temp = [];
			for (var j=0; j<history_size; j++){
				temp[j] = 0;
			}
			this.midiEventsBuffer[i] = temp;
			this.midiBuffer[i] = temp;

			this.currentNoteOn[i] = 0;
			this.currentNoteOff[i] = 0;
		
		}

		// console.log("Events buffer:",this.midiEventsBuffer);
		// console.log("currentNoteOn:",this.currentNoteOn);
		// console.log("currentNoteOff:",this.currentNoteOff);
		
		//  Message for validationg that the browser supports WebMIDI
		if (navigator.requestMIDIAccess) {
			console.log('This browser supports WebMIDI!');
			navigator.requestMIDIAccess().then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
		} 
		else {
			console.log('WebMIDI is not supported in this browser.');
		}

		
	}


	onMIDISuccess(midiAccess) {
		console.log(midiAccess);

		this.midiAccess = midiAccess;

		var inputs = midiAccess.inputs;
		var outputs = midiAccess.outputs;
		for (var input of inputs.values()){
			input.onmidimessage = this.getMIDIMessage.bind(this);
		}
	}


	onMIDIFailure() {
		console.log('Could not access your MIDI devices.');
	}


	getMIDIMessage(midiMessage) {

		// console.log(this.mute_btn.checked);

		
		
		if (!midiMessage.data){
			var type = parseInt(midiMessage[0]);
			var midiNote = parseInt(midiMessage[1]);
			var velocity = parseInt(midiMessage[2]);
		}
		else{
			var type = parseInt(midiMessage.data[0]);
			var midiNote = parseInt(midiMessage.data[1]);
			var velocity = parseInt(midiMessage.data[2]);
		}


		// // console.log(midiMessage.data); //[144, 72, 64]

		// // A command value of 144 signifies a “note on” event, and 128 typically signifies a “note off” event.

		// var type = parseInt(midiMessage.data[0]);
		// var midiNote = parseInt(midiMessage.data[1]);
		// var velocity = parseInt(midiMessage.data[2]);

		// Note on = 144
		if ((type === 144)&&(velocity!=0)){

			if (this.currentNoteOn[midiNote] === 0){

				console.log("currentNoteOn is zero!!!!!!!!!!!")

				var delay = 0; // play one note every quarter second
				// var note = parseInt(note.substr(1))+21; // the MIDI note
				var velocity = 127; // how hard the note hits
				// MIDI.setVolume(0, 127);   
				
				if (!this.mute_btn.checked){
					MIDI.noteOn(0, midiNote, velocity, delay);

				}
				

			}
			
			this.currentNoteOn[midiNote] = velocity;
			this.currentNoteOff[midiNote] = 0;
			// console.log(this.currentNoteOn);

			// var delay = 0; // play one note every quarter second
			// // var note = parseInt(note.substr(1))+21; // the MIDI note
			// var velocity = 127; // how hard the note hits
			// // MIDI.setVolume(0, 127);   
			// MIDI.noteOn(0, midiNote, velocity, delay);
		}
		// Note off = 128
		else if ((type === 128)||(velocity===0)){
			this.currentNoteOff[midiNote] = 1;
			this.currentNoteOn[midiNote] = 0;
			// console.log(this.currentNoteOff);
			var delay = 0; // play one note every quarter second
			// var note = parseInt(note.substr(1))+21; // the MIDI note
			var velocity = 0; // how hard the note hits
			// MIDI.setVolume(0, 127); 
			if (!this.mute_btn.checked){  
				MIDI.noteOff(0, midiNote, delay + 0.08);
			}
		}
	}


	progressTime(){
		
		for (var i=0; i<128; i++){

			// Remove an item from the beginning of an array
			
			this.midiEventsBuffer[i].shift();


			// Add items to the end of an array

			if (this.currentNoteOff[i]===1){
				this.midiEventsBuffer[i].push(0);
			}
			// else if (this.currentNoteOn[i]===1){
			else if (this.currentNoteOn[i]>0){
				this.midiEventsBuffer[i].push(this.currentNoteOn[i]);
			}
			else{
				this.midiEventsBuffer[i].push(0);
			}
			
		}
		// console.log(this.midiEventsBuffer[40]," ", this.midiEventsBuffer[41]);
		return this.midiEventsBuffer;
	}

	// progressBuffer(){
		
	// 	for (var i=0; i<128; i++){

	// 		// Remove an item from the beginning of an array
			
	// 		this.midiEventsBuffer[i].shift();


	// 		// Add items to the end of an array

	// 		if (this.currentNoteOff[i]===1){
	// 			this.midiEventsBuffer[i].push(0);
	// 		}
	// 		// else if (this.currentNoteOn[i]===1){
	// 		else if (this.currentNoteOn[i]>0){
	// 			this.midiEventsBuffer[i].push(this.currentNoteOn[i]);
	// 		}
	// 		else{
	// 			this.midiEventsBuffer[i].push(0);
	// 		}
			
	// 	}

	// 	return this.midiEventsBuffer;
	// }

}