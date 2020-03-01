class ChartClass{

    constructor(measures){
        // tempo
        this.tempo = [];
        // time signature
        this.timeSignature = [];
        // how many onsets the chart has in total
        this.total_onsets_length = [];
        // counter of onsets for passing to measures
        this.onset_counter = 0;
        // how many bars
        this.bars_number = measures.length;
        // bars structure
        this.measures = [];
        // construct chord events
        this.chord_events = [];
        this.total_onsets_length = [];

        // functions
        var that = this;

        this.compile_info = function( m ){
            for (var i=0; i<m.length; i++){
                that.measures.push( new ChartMeasure( m[i] , that.onset_counter  , m[i].idx ) );
                var measure_length = m[i].ts_numerator*(4/m[i].ts_denominator);
                that.onset_counter += measure_length;
            }
            that.bars_number = that.measures.length;
            that.total_onsets_length = that.onset_counter;
            that.tempo = parseInt(document.getElementById("tempo_slider").value);
            that.timeSignature = document.getElementById("ts_selector").value;
        }

        this.save_chart = function( m , file_name ){
            that.reset_chart_info();
            that.compile_info( m );
            that.construct_chord_events();
            var chart_json = {
                'name': file_name,
                'tempo': that.tempo,
                'time_signature': that.timeSignature,
                'bars_num': that.bars_number,
                'chord_events': that.chord_events
            };
            that.download_json(chart_json, file_name, 'application/json');
        }

        this.construct_chord_events = function(){
            for(var i=0; i<that.measures.length; i++){
                var tmp_strong = true;
                for(var j=0; j<that.measures[i].beats.length; j++){
                    that.chord_events.push( new ChordEvent(
                        that.measures[i].beats[j].root,
                        that.measures[i].beats[j].type,
                        that.measures[i].beats[j].onset,
                        tmp_strong,
                        that.measures[i].idx,
                        that.measures[i].beats[j].onset_in_measure
                    ) );
                    tmp_strong = false;
                }
            }
            // fix same chords
            for (var i=1; i<that.chord_events.length; i++){
                if(that.chord_events[i].root == 'Same'){
                    that.chord_events[i].root = that.chord_events[i-1].root;
                }
                if(that.chord_events[i].type == 'Same'){
                    that.chord_events[i].type = that.chord_events[i-1].type;
                }
            }
        }
        // compile all information
        this.compile_info( measures );

        this.construct_chord_events();

        this.download_json = function(content, fileName, contentType) {
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
        
        this.reset_chart_info = function(){
            // tempo
            that.tempo = []
            // time signature
            that.timeSignature = [];
            // how many onsets the chart has in total
            that.total_onsets_length = [];
            // counter of onsets for passing to measures
            that.onset_counter = 0;
            // how many bars
            that.bars_number = measures.length;
            // bars structure
            that.measures = [];
            // construct chord events
            that.chord_events = [];
            that.total_onsets_length = [];
        }
    }
}

class ChartMeasure{
    constructor( bar_div , onset, idx ){
        // this.idx = bar_div.idx;
        this.onset = onset;
        this.idx = idx;
        var total_onset_counter= this.onset;
        var measure_onset_counter= 0;
        this.timeSignature = bar_div.timeSignature;
        this.duration = bar_div.ts_numerator*(4/bar_div.ts_denominator);
        this.beats = [];
        for(var i=0; i<bar_div.beat_divs.length; i++){
            this.beats.push(  new ChartBeat( bar_div.beat_divs[i] , total_onset_counter, measure_onset_counter ));
            total_onset_counter += 4/bar_div.ts_denominator;
            measure_onset_counter += 4/bar_div.ts_denominator;
        }
    }
}

class ChartBeat{
    constructor( beat , onset, onset_in_measure ){
        this.roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Same'];
        this.types = [' ', 'm', 'm7', String('\u25B5'), '7', String('\u2205'), 'Same'];
        this.onset = onset;
        this.onset_in_measure = onset_in_measure;
        this.root = beat.rootSelect.value;
        this.type = beat.typeSelect.value;
        this.root_number = this.roots.indexOf( beat.rootSelect.value );
        this.type_number = this.types.indexOf( beat.typeSelect.value );
    }
}

class ChordEvent{
    constructor(root, type, onset, is_strong, measure_index, beat_in_measure){
        this.root = root;
        this.type = type;
        this.root_shown = root;
        this.type_shown = type;
        this.onset = onset;
        this.is_strong = is_strong;
        this.measure_index = measure_index;
        this.beat_in_measure = beat_in_measure;
    }
}