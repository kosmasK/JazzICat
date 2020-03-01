// dictionaries for translating chord symbol to chord info
var roots2bin_dictionary = {
    'C':    [1,0,0,0,0,0,0,0,0,0,0,0],
    'C#':   [0,1,0,0,0,0,0,0,0,0,0,0],
    'Db':   [0,1,0,0,0,0,0,0,0,0,0,0],
    'D':    [0,0,1,0,0,0,0,0,0,0,0,0],
    'D#':   [0,0,0,1,0,0,0,0,0,0,0,0],
    'Eb':   [0,0,0,1,0,0,0,0,0,0,0,0],
    'E':    [0,0,0,0,1,0,0,0,0,0,0,0],
    'F':    [0,0,0,0,0,1,0,0,0,0,0,0],
    'F#':   [0,0,0,0,0,0,1,0,0,0,0,0],
    'Gb':   [0,0,0,0,0,0,1,0,0,0,0,0],
    'G':    [0,0,0,0,0,0,0,1,0,0,0,0],
    'G#':   [0,0,0,0,0,0,0,0,1,0,0,0],
    'Ab':   [0,0,0,0,0,0,0,0,1,0,0,0],
    'A':    [0,0,0,0,0,0,0,0,0,1,0,0],
    'A#':   [0,0,0,0,0,0,0,0,0,0,1,0],
    'Bb':   [0,0,0,0,0,0,0,0,0,0,1,0],
    'B':    [0,0,0,0,0,0,0,0,0,0,0,1]
};
// console.log('roots2bin_dictionary: ', roots2bin_dictionary)
var types2bin_dictionary = {
    ' ':        [0,1 , 0,1 , 0,0],
    'm':        [1,0 , 0,1 , 0,0],
    'm7':       [1,0 , 0,1 , 1,0],
    '\u25B5':   [0,1 , 0,1 , 0,1],
    '7':        [0,1 , 0,1 , 1,0],
    '\u2205':   [1,0 , 1,0 , 1,0],
    '+':        [0,1 , 1,1 , 1,0]
};

// function that gets a chord string and returns the respective binary chord info array
function chord2bin( r , t ){
    // console.log('r: ' + r + ' - t: ' + t);
    // console.log('r - bin: ', roots2bin_dictionary[r]);
    // console.log('t - bin: ', types2bin_dictionary[t]);

    console.log("t: ",t," r:",r);


    return roots2bin_dictionary[r].concat( types2bin_dictionary[t] );
}

// this.types = [' ', 'm', 'm7', String('\u25B5'), '7', String('\u2205')];
function construct_controls_UI(){
    // select how many bars - div =====================
    var bars_num_div = document.createElement("div");
    document.body.append(bars_num_div);
    var bars_num_span = document.createElement("span");
    bars_num_div.append(bars_num_span);
    bars_num_span.innerHTML = "Number of bars: ";
    var bars_number_selector = document.createElement("select");
    bars_num_div.append(bars_number_selector);
    bars_number_selector.id = "bars_number_selector";
    var bar_number_options = ['4', '8', '12', '16', '20', '24', '28', '32'];
    var bar_number_option_numbers = [1,2,3,4,5,6,7,8];
    for (var i = 0; i < bar_number_options.length; i++) {
        var option = document.createElement("option");
        option.value = bar_number_option_numbers[i];
        option.text = bar_number_options[i];
        bars_number_selector.appendChild(option);
    }
    
    bars_number_selector.onchange = function(){

    	
        num_of_bar_quadruples = bars_number_selector.value;
        construct_bars_UI();
        construct_bars_content();
        stop_metronome();
    }
    // div for time signature
    var ts_div = document.createElement("div");
    document.body.append(ts_div);
    var ts_span = document.createElement("span");
    ts_div.append(ts_span);
    ts_span.innerHTML = "Time Signature: ";
    var ts_selector = document.createElement("select");
    ts_div.append(ts_selector);
    ts_selector.id = "ts_selector";
    var ts_options = ['4/4', '3/4'];
    for (var i = 0; i < ts_options.length; i++) {
        var option = document.createElement("option");
        option.value = ts_options[i];
        option.text = ts_options[i];
        ts_selector.appendChild(option);
    }
    ts_selector.onchange = function(){
        timeSig = ts_selector.value;
        construct_bars_UI();
        construct_bars_content();
        set_time_signature(timeSig);
    }
    // div for tempo =====================
    var tempo_div = document.createElement("div");
    document.body.append(tempo_div);
    var tempo_slider = document.createElement("input");
    tempo_div.append(tempo_slider);
    tempo_slider.type = "range";
    tempo_slider.id = "tempo_slider";
    tempo_slider.min = 10;
    tempo_slider.max = 300;
    tempo_slider.value = 90;
    tempo_slider.step = 1;
    tempo_slider.class = "slider";
    tempo_slider.onchange = function(){
        tempo_change();
    }
    tempo_slider.oninput = function(){
        tempo_change();
    }
    var tempo_change = function(){
        metronome.setTempo( tempo_slider.value );
        document.getElementById("tempo_value_span").innerHTML = tempo_slider.value;
    }
    var tempo_span = document.createElement("span");
    tempo_span.innerHTML = "Tempo: ";
    tempo_div.append(tempo_span);
    var tempo_value_span = document.createElement("span");
    tempo_value_span.innerHTML = "90";
    tempo_value_span.id = "tempo_value_span";
    tempo_div.append(tempo_value_span);
    // // div for save button and textbox ==================
    // var save_div = document.createElement("div");
    // document.body.append(save_div);
    // save_div.id = "save_div";
    // var save_text_box = document.createElement("input");
    // save_div.append(save_text_box);
    // save_text_box.id = "save_text_box";
    // save_text_box.type = "text";
    // save_text_box.value = "piece_name";
    // // buttons to save current piece to json
    // var save_button = document.createElement("button");
    // save_div.append(save_button);
    // save_button.innerHTML = "Save piece";
    // save_button.onclick = function(){
    //     var file_name = save_text_box.value + '.json';
    //     console.log("saving: " + file_name);
    //     chart_object.save_chart(allBars, file_name);
    // }
    // div for load button and dropdown ==================
    var load_div = document.createElement("div");
    var piece_selector = document.createElement("select");
    load_div.append(piece_selector);
    piece_selector.id = "piece_selector";
    var piece_options = ['all_of_me.json', 'au_privave.json'];
    for (var i = 0; i < ts_options.length; i++) {
        var option = document.createElement("option");
        option.value = piece_options[i];
        option.text = piece_options[i];
        piece_selector.appendChild(option);
    }
    var file_name = 'au_privave.json';
    piece_selector.onchange = function(){
        file_name = piece_selector.value;
    }
    document.body.append(load_div);
    load_div.id = "load_div";
    var load_button = document.createElement("button");
    load_div.append(load_button);
    load_button.innerHTML = "Load piece";
    load_button.onclick = function(){
        console.log("loading: " + file_name);
        $.getJSON('pieces/' + file_name, function(json) {
            load_from_json(json);
        });
    }
    // // div for export button ==================
    // var export_div = document.createElement("div");
    // document.body.append(export_div);
    // export_div.id = "export_div";
    // var export_button = document.createElement("button");
    // export_div.append(export_button);
    // export_button.innerHTML = "Export test";
    // export_button.onclick = function(){
    //     var file_name = 'test_2.json';
    //     console.log("loading: " + file_name);
    //     $.getJSON('pieces/' + file_name, function(json) {
    //         export_test_json(json);
    //     });
    // }
    // div for play-stop button
    var playstop_div = document.createElement("div");
    document.body.append(playstop_div);
    playstop_div.id = "playstop_div";
    var playstop_button = document.createElement("button");
    playstop_div.append(playstop_button);
    playstop_button.innerHTML = "Play";
    playstop_button.id = "playstop_button";
    playstop_button.onclick = function(){
        console.log("play pressed: ", chart_object);

        // context.resume().then(() => {
        //     console.log('Playback resumed successfully');
        // });

        // TESTING highlighting of current measure/beat
        // get total beats of chart according to the sum of the time signature numerator times all measures
        num_bars = (num_of_bar_quadruples*4)
        // it is assumed that all bars have the same time signature
        beats_per_bar = allBars[0].ts_numerator;
        if (!play_status){
            // turn on and highlight first chord
            // play_status = true;

            // run tensorflow
            make_inputs_and_run_play(play_metronome);
            // play_metronome();
            
            // metronome.toolSendsPlayStop( play_status );
            // metronome.setSoundOnOff( play_status );
            // // var tmp_beat = chart_object.chord_events[ beat_highlight ];
            // // document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "red";
            // beat_highlight = -1;
            // document.getElementById('playstop_button').innerHTML = "Stop";
        }else{
            // play_status = false;
            stop_metronome();
            // metronome.toolSendsPlayStop( play_status );
            // metronome.setSoundOnOff( play_status );
            // // de-highlight previous beat
            // console.log('de-highlighting: ', beat_highlight);
            // var tmp_beat = chart_object.chord_events[ beat_highlight ];
            // document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "grey";
            // // // highlight next beat or measure
            // // beat_highlight += 1;
            // // beat_highlight %= num_bars*beats_per_bar;
            // // var tmp_beat = chart_object.chord_events[ beat_highlight ];
            // // document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "red";
            // document.getElementById('playstop_button').innerHTML = "Play";
            // beat_highlight = 0;
        }
        // here we should change the label of the button to stop
    }
    // var playnext_button = document.createElement("button");
    // playstop_div.append(playnext_button);
    // playnext_button.innerHTML = "Next";
    // playnext_button.id = "playstop_button_next";
    // playnext_button.onclick = function(){
    //     if(play_status){
    //         play_status = false;
    //         stop_metronome();
    //     }
    //     if (first_time_next){
    //         // get total beats of chart according to the sum of the time signature numerator times all measures
    //         num_bars = (num_of_bar_quadruples*4)
    //         // it is assumed that all bars have the same time signature
    //         beats_per_bar = allBars[0].ts_numerator;
    //         stop_metronome();
    //         first_time_next = false;
    //     }
    //     if (eighth_value%2 == 0){
    //         highlight_beat_on_chart();
    //     }
    //     eighth_value++;
    //     make_inputs_and_run(midi);
    // }
}

function playNextEighth(){
    // if(play_status){
    //     play_status = false;
    //     stop_metronome();
    // }
    if (first_time_next){
        // get total beats of chart according to the sum of the time signature numerator times all measures
        num_bars = (num_of_bar_quadruples*4)
        // it is assumed that all bars have the same time signature
        beats_per_bar = allBars[0].ts_numerator;
        stop_metronome();
        first_time_next = false;
    }
    if (eighth_value%2 == 0){
        // highlight_beat_on_chart();
    }
    console.log('app beat number: ', eighth_value);
    eighth_value++;
    make_inputs_and_run(midi);
}

function play_metronome(){
	console.log("play metronome")

    stop_metronome();
    play_status = true;
    metronome.toolSendsPlayStop( play_status );
    metronome.setSoundOnOff( muteMetroBtn.checked );
    // metronome.setSoundOnOff( play_status );
    // var tmp_beat = chart_object.chord_events[ beat_highlight ];
    // document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "red";
    // beat_highlight = -1;
    document.getElementById('playstop_button').innerHTML = "Stop";
}
function stop_metronome(){
    play_status = false;
    metronome.toolSendsPlayStop( play_status );
    metronome.setSoundOnOff( muteMetroBtn.checked );
    // de-highlight previous beat
    console.log('de-highlighting: ', beat_highlight);
    document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "grey";
    chart_object = new ChartClass( allBars );
    beat_highlight = 0;
    eighth_value = 0;
    tmp_beat = chart_object.chord_events[ beat_highlight ];
    document.getElementById('playstop_button').innerHTML = "Play";
    
    // tmp_beat = chart_object.chord_events[ beat_highlight ];


    // if (!beforePlay){
    // 	initBuffersAndStates();
    // }
    // initBuffersAndStates();

    // make_inputs_and_run_init();


}

// metronome events
document.addEventListener('beatEvent', function (e){
    highlight_beat_on_chart();
});

function highlight_beat_on_chart(){
    console.log('bang!');
    // de-highlight previous beat
    if (beat_highlight-1 >= 0){
        tmp_beat = chart_object.chord_events[ beat_highlight-1 ];
        document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "grey";
    }else{
        tmp_beat = chart_object.chord_events[ chart_object.chord_events.length-1 ];
        document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "grey";
    }
    // highlight next beat or measure
    console.log('beat_highlight: ', beat_highlight);
    console.log('num_bars: ', num_bars);
    console.log('beats_per_bar: ', beats_per_bar);
    tmp_beat = chart_object.chord_events[ beat_highlight ];
    document.getElementById( "m_" + String(tmp_beat.measure_index) + "_chord_span_id_" + String(tmp_beat.beat_in_measure) ).style.backgroundColor = "red";
    beat_highlight += 1;
    beat_highlight %= num_bars*beats_per_bar;
}

document.addEventListener('eighthEvent', (e) => {
    // console.log("1",midi);
    make_inputs_and_run(midi);
});

function set_time_signature(t){
    if( t == '3/4' ){
        metronome.setNumerator(3);
    }else{
        metronome.setNumerator(4);
    }
    beats_per_bar = allBars[0].ts_numerator;
    stop_metronome();
}

function export_test_json(){
    console.log('exporting test');
    // console.log('chart_object.chord_events: ', chart_object.chord_events);
    console.log('chart_object: ', chart_object);
    // number of repetitions
    var reps_to_make = 4;
    // number of chords that corresponds to given repetitions
    var num_of_chords = chart_object.chord_events.length;
    // initialise chord info matrix
    chord_info_matrix = new Array(time_step).fill( new Array( 18 ).fill( 0 ) );
    // initialise beat info / array
    // current_beat_info = false;
    tmp_beat_info = false;
    beat_info_array = new Array(time_step).fill(0);
    // initialise melody array
    var melody_array = new Array(time_step).fill(128);
    for(var i=0; i<reps_to_make*num_of_chords*2; i++){
        // get current beat/ info and push in beat array
        tmp_beat = chart_object.chord_events[ Math.floor(i/2)%num_of_chords ];
        current_beat_info = tmp_beat.is_strong && !tmp_beat_info ? 1 : 0;
        tmp_beat_info = tmp_beat.is_strong ? 1 : 0;
        beat_info_array.push( current_beat_info );
        // get current chord/ info and push in chord matrix
        current_chord_info = chord2bin( tmp_beat.root , tmp_beat.type );
        chord_info_matrix.push(current_chord_info);
        // get current melody/ info and push in melody array
        var current_melody = 128; // change algorithmically if necessary, or from stored melodic file (?)
        melody_array.push( current_melody );
    }
    // shift chord info and beat info
    chord_info_matrix.shift();
    chord_info_matrix.push( new Array( 18 ).fill( 0 ) );
    beat_info_array.shift();
    beat_info_array.push( 0 );
    // create human input
    var human_input = [];
    // columns first
    for (var j=0; j<beat_info_array.length; j++){
        var tmp_column = [];
        tmp_column.push(beat_info_array[j]);
        tmp_column.push(melody_array[j]);
        for (var i=0; i<chord_info_matrix[0].length; i++){
            tmp_column.push( chord_info_matrix[j][i] );
        }
        console.log(tmp_column);
        human_input.push(tmp_column);
    }
    // create bot input
    // shift melody
    melody_array.shift();
    melody_array.push( 128 );
    var bot_input = [];
    // columns first
    for (var j=0; j<beat_info_array.length; j++){
        var tmp_column = [];
        tmp_column.push(beat_info_array[j]);
        tmp_column.push(melody_array[j]);
        // p1
        tmp_column.push( 0 );
        for (var i=0; i<chord_info_matrix[0].length; i++){
            tmp_column.push( chord_info_matrix[j][i] );
        }
        console.log(tmp_column);
        bot_input.push(tmp_column);
    }
    printMatrix( bot_input );
    var json_content = {
        'human_data': human_input,
        'bot_data': bot_input
    };
    var file_name = save_text_box.value + '_for_python.json';
    console.log("exporting: " + file_name);
    download_json( json_content, file_name, 'application/json' );
}
var download_json = function(content, fileName, contentType) {
    console.log('downloading');
    var data = JSON.stringify(content);
    var file = new Blob([data], {type: contentType});
    var a = document.createElement('a');
    a.id = 'a';
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.textContent = "Download " + fileName;
    document.body.append( a );
    a.click();
    document.body.removeChild( document.getElementById('a') );
}

function load_from_json(json){
    stop_metronome();
    // beat_highlight = 0;
    // // TODO: also stop player, change play status and break play loop in the metronome
    // play_status = false;
    // metronome.toolSendsPlayStop( play_status );
    // metronome.setSoundOnOff( play_status );
    // document.getElementById('playstop_button').innerHTML = "Play";
    chart_object = json;
    // bars number dropdown
    num_of_bar_quadruples = parseInt(json['bars_num']/4);
    document.getElementById('bars_number_selector').value = String( num_of_bar_quadruples );
    //time signature dropdown
    document.getElementById('ts_selector').value = json['time_signature'];
    timeSig = json['time_signature'];
    set_time_signature( timeSig );
    // tempo slider
    document.getElementById('tempo_slider').value = json['tempo'];
    document.getElementById('tempo_value_span').innerHTML = json['tempo'];
    // setting metronome tempo
    metronome.setTempo(json['tempo']);
    construct_bars_UI();
    construct_bars_content();
    // assign chords in each beat div
    for (var i=0; i<json.chord_events.length; i++){
        allBars[ json.chord_events[i].measure_index ].beat_divs[ json.chord_events[i].beat_in_measure ].assign_root_and_type( json.chord_events[i].root_shown , json.chord_events[i].type_shown )
    }
    // construct strings in measures
    for (var i=0; i<allBars.length; i++){
        allBars[i].update_label_in_measure();
    }
}

function construct_bars_UI(){
    if (document.getElementById("main_div")){
        document.body.removeChild( document.getElementById("main_div") );
    }else{
        console.log("NO main_div to remove");
    }

    // var main_div = document.getElementById("control_system");

    var main_div = document.createElement('div');
    main_div.classList.add("grid-container");
    main_div.id = "main_div";
    document.body.append(main_div);
    for (var i=0; i<num_of_bar_quadruples*4; i++){
        var tmpDiv = document.createElement('div');
        tmpDiv.classList.add("grid-item");
        tmpDiv.id = "grid-item_" + String(i);
        main_div.append(tmpDiv);
    }
}

function construct_bars_content(){
    allBars = [];
    for(var i=0; i<num_of_bar_quadruples*4; i++){
        allBars.push( new MeasureDiv("grid-item_"+String(i), i, timeSig) );
    }
}