var beforePlay = false;


function initBuffersAndStates(){
	console.log("reset buffers and states");
    beat_info_array = new Array(time_step).fill(0);
    chord_info_matrix = new Array(time_step).fill( new Array( 18 ).fill( 0 ) );
    tmp_beat_info = false;
    human_midi_array = new Array(time_step).fill(128);
    human_prediction_array = new Array(time_step).fill(128);
    bot_prediction_array = new Array(time_step).fill(0);

    make_inputs_and_run_init();

}


function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}



function playBot(){
    // var botPred = bot_prediction_array[bot_prediction_array.length-1];
    // var notes128Array = tSystem.classToNotes(botPred);
    // var noteToPlay = getAllIndexes(notes128Array,1);

    // console.log("notes",noteToPlay);

    // MIDI.noteOn(channel, note, velocity, delay);
    // MIDI.noteOff(channel, note, delay);
    // MIDI.chordOn(channel, [note, note, note], velocity, delay);
    // MIDI.chordOff(channel, [note, note, note], delay);


    // MIDI.chordOn(0, noteToPlay, 127, 0);
    // MIDI.chordOff(0, noteToPlay, 0.08);

    var previousBotPred = bot_prediction_array[bot_prediction_array.length-2];
    var currentBotPred = bot_prediction_array[bot_prediction_array.length-1];


    if ((JSON.stringify(previousBotPred)) != (JSON.stringify(currentBotPred))){
        var notes128Array = tSystem.classToNotes(currentBotPred);
        var noteToPlay = getAllIndexes(notes128Array,1);

        console.log("notes",noteToPlay);

        // MIDI.noteOn(channel, note, velocity, delay);
        // MIDI.noteOff(channel, note, delay);
        // MIDI.chordOn(channel, [note, note, note], velocity, delay);
        // MIDI.chordOff(channel, [note, note, note], delay);

        if (!beforePlay){
        	MIDI.chordOn(0, noteToPlay, 127, 0);
        	MIDI.chordOff(0, noteToPlay, 0.08);
        }
        
    }

    else console.log("SAME!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");


}

function make_inputs_and_run(midi){
    // play previously predicted bot notes
    playBot();


    // make beat info, stored in 
    // beat_info_array
    update_beat_info();

    // make chord info, stored in 
    // chord_info_matrix
    update_chord_info();

    // TODO: Kosmas-Theatina, complete the following functions
    // TODO: don't forget to fetch the note/chord translation dictionaries from python!!!
    // update human/midi input, stored in
    // human_midi_array
    // console.log(midi)
    update_human_info(midi);

    // update human prediction, stored in 
    // human_prediction_array - need to run the human part of the system
    update_human_prediction();

    // update bot prediction, stored in
    // bot_prediction_array - need to run the bot part of the system
    update_bot_prediction();


}

function make_inputs_and_run_play(callbackFunction){

	initBuffersAndStates();

	beforePlay = true;


	
	var bars_number_selector = document.getElementById("bars_number_selector");

	var bars = parseInt(bars_number_selector.options[ bars_number_selector.selectedIndex ].text)
	// console.log("bars",bars)

	var ts_selector = document.getElementById("ts_selector");

	var ts = parseInt(ts_selector.options[ ts_selector.selectedIndex ].text[0]);
	// console.log("time signature",ts)

	var number_of_eighths = bars*(ts*2);
	// console.log("Number of eighths",number_of_eighths);

	for (var i=0; i<number_of_eighths; i++){

        // document.getElementById("playstop_button_next").click();
        playNextEighth();


		// make beat info, stored in 
	    // beat_info_array
	    // update_beat_info();

	    // console.log()
	    
	    // make chord info, stored in 
	    // chord_info_matrix
	    // update_chord_info();


	    // update human prediction, stored in 
	    // human_prediction_array - need to run the human part of the system
	    // update_human_prediction();

	    // update bot prediction, stored in
	    // bot_prediction_array - need to run the bot part of the system
	    // update_bot_prediction();

	    var beat_info_array_copy = JSON.parse(JSON.stringify(beat_info_array));
		var human_midi_array_copy = JSON.parse(JSON.stringify(human_midi_array));
		var bot_prediction_array_copy = JSON.parse(JSON.stringify(bot_prediction_array));
		var chord_info_matrix_copy = JSON.parse(JSON.stringify(chord_info_matrix));


		console.log(i," DONE !!!! \n",
			"beat:",beat_info_array_copy,"\n",
			"human:",human_midi_array_copy,"\n",
			"bot:",bot_prediction_array_copy,"\n",
			"chord_info:",chord_info_matrix_copy,"\n",
			"DONE!!!!");

	}

	var beat_info_array_copy = JSON.parse(JSON.stringify(beat_info_array));
	var human_midi_array_copy = JSON.parse(JSON.stringify(human_midi_array));
	var bot_prediction_array_copy = JSON.parse(JSON.stringify(bot_prediction_array));
	var chord_info_matrix_copy = JSON.parse(JSON.stringify(chord_info_matrix));


	console.log("DONE !!!! \n",
		"beat:",beat_info_array_copy,"\n",
		"human:",human_midi_array_copy,"\n",
		"bot:",bot_prediction_array_copy,"\n",
		"chord_info:",chord_info_matrix_copy,"\n",
		"DONE!!!!");

	beforePlay = false;
	callbackFunction();
}

function make_inputs_and_run_init(){
		// make beat info, stored in 
    // beat_info_array
    update_beat_info();

    console.log()
    
    // make chord info, stored in 
    // chord_info_matrix
    update_chord_info();

    // TODO: Kosmas-Theatina, complete the following functions
    // TODO: don't forget to fetch the note/chord translation dictionaries from python!!!
    // update human/midi input, stored in
    // human_midi_array
    // console.log(midi)
    // update_human_info(midi);

    // update human prediction, stored in 
    // human_prediction_array - need to run the human part of the system
    update_human_prediction();

    // update bot prediction, stored in
    // bot_prediction_array - need to run the bot part of the system
    update_bot_prediction();

}



function update_beat_info(){
    // collect information from the chart
    // tmp_beat = chart_object.chord_events[ beat_highlight ];
    // get beat information: 1 if in the beginning of measure, 0 otherwise (is_strong attribute)
    // DONE: make it 1 only when it first enters the first beat
    // now it stays 1 while (for both eights) it is in the first beat
    current_beat_info = tmp_beat.is_strong && !tmp_beat_info ? 1 : 0;
    tmp_beat_info = tmp_beat.is_strong ? 1 : 0;
    // pass to the array
    beat_info_array.shift();
    beat_info_array.push(current_beat_info);
    // console.log('running update_beat_info',beat_info_array);

}

function update_chord_info(){
    // get chord info from the current chord event of the chart object
    current_chord_info = chord2bin( tmp_beat.root , tmp_beat.type );
    // console.log('current_chord_info: ', current_chord_info)
    chord_info_matrix.shift();
    chord_info_matrix.push(current_chord_info);
    // printMatrix( chord_info_matrix );
    // console.log('running update_chord_info',chord_info_matrix);
}

function update_human_info(midi){
    // get array of aggregated notes from midi input
    // var bufferLength = midi.midiEventsBuffer.length;
    var current_midi = midi.currentNoteOn;

    var currentMidiNote = [];

    for (var i=0; i<current_midi.length; i++){
        if(current_midi[i]>0){
            currentMidiNote.push(i);
        }
    }

    if (currentMidiNote.length<1){
        // silence = 128
        currentMidiNote.push(128);
    }

    human_midi_array.shift();
    // human_midi_array.push(currentMidiNote[0]);

    human_midi_array.push(currentMidiNote[currentMidiNote.length-1]);

    // console.log('running update_human_info',human_midi_array);
}

function update_human_prediction(){
    // make a single input matrix by compiling information from
    // - beat_info_array
    // - human_midi_array
    // - chord_info_matrix
    // run human prediction - TENSORFLOW

    var input = [];

    var maxNoteIndex = 128;
    var maxNotePred = 0;
    // console.log("Beat info",beat_info_array);
    // console.log("Chord info",chord_info_matrix);
    input.push(beat_info_array);
    input.push(human_midi_array);

    var transposedChordInfo = chord_info_matrix[0].map((col, i) => chord_info_matrix.map(row => row[i]));

    // console.log("Chord Info",chord_info_matrix);
    // console.log("Transposed chord info", transposedChordInfo);

    for (var i = 0; i<transposedChordInfo.length;i++){
        input.push(transposedChordInfo[i]);
    }

    // console.log("input",input);
    var transposedArray = input[0].map((col, i) => input.map(row => row[i]));
    // console.log("transposedArray",transposedArray);

    var input_tensor = tf.tensor(transposedArray);
    input_tensor = input_tensor.reshape([-1,16,20]);

    // input_tensor.print();

    if (tSystem.model_hum != "human"){

        // var input_tensor = tf.tensor(transposedArray);
        // console.log("Human tensor: ", input_tensor)
        var pred = tSystem.model_hum.predict(input_tensor);
        // console.log("human pred",pred.dataSync());

        maxNotePred = tf.max(pred).dataSync();
        maxNoteIndex = tf.argMax(pred,1).dataSync()

        // console.log("human pred 2 max",maxNotePred);
        // console.log("human pred 3 argMax",maxNoteIndex);
        
    }

    human_prediction_array.shift();
    human_prediction_array.push(maxNoteIndex[0]);

    // console.log('running update_human_prediction:',human_prediction_array);
    
}

function update_bot_prediction(){
    // make a single input matrix by compiling information from
    // - beat_info_array
    // - human_prediction_array
    // - bot_stream_array or bot_prediction_array
    // - chord_info_matrix
    // run human prediction - TENSORFLOW

    var input = [];

    var lastHumanPred = human_prediction_array[human_prediction_array.length-1];

    // console.log("last human pred", lastHumanPred);

    var human_midi_array_copy = JSON.parse(JSON.stringify(human_midi_array));

    // console.log("human_midi_array", human_midi_array);
    
    // human_midi_array_copy[human_midi_array_copy.length-1] = lastHumanPred;

    human_midi_array_copy.shift();
    human_midi_array_copy.push(lastHumanPred);


    // console.log("human_midi_array_copy", human_midi_array_copy);
    
    // input.push(beat_info_array);
    
    // input.push(human_midi_array); human_midi_array_copy.shift() human_midi_array_copy.push(lastHumanPred)
    // bot_prediction_array

    var input = [];
    input.push(beat_info_array);
    input.push(human_midi_array_copy);
    input.push(bot_prediction_array);

    var transposedChordInfo = chord_info_matrix[0].map((col, i) => chord_info_matrix.map(row => row[i]));

    for (var i = 0; i<transposedChordInfo.length;i++){
        input.push(transposedChordInfo[i]);
    }

    // console.log("input:",input);
    

    var transposedArray = input[0].map((col, i) => input.map(row => row[i]));


    var input_tensor = tf.tensor(transposedArray);
    input_tensor = input_tensor.reshape([-1,16,21]);
    
    // input_tensor.print();

    if (tSystem.model_bot != "bot"){

        // var input_tensor = tf.tensor(transposedArray);
        var pred = tSystem.model_bot.predict(input_tensor);
        // console.log("human pred",pred.dataSync());

        maxNotePred = tf.max(pred).dataSync();
        maxNoteIndex = tf.argMax(pred,1).dataSync()

        // console.log("human pred 2 max",maxNotePred);
        // console.log("bot pred argMax",maxNoteIndex);
        
    }

    bot_prediction_array.shift();
    bot_prediction_array.push(maxNoteIndex);

    // console.log('running update_bot_prediction',bot_prediction_array);
    // afterwards translate bot output to actual notes through the dictionary
}

// AUX FUNCTIONS
function printMatrix( m ){
    console.log('--------------------------------------');
    var row_string = '';
    for(var i=0; i<m.length; i++){
        for(var j=0; j<m[i].length; j++){
            row_string += String(m[i][j]) + ' ';
        }
        row_string += '\n';
    }
    // console.log(row_string);
}