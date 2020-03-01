class MeasureDiv{

    constructor(host_div_id, measure_idx, measure_ts){
        // define zoom in/out ratios
        this.zoomed_in_width = "250px";
        this.zoomed_in_height = "230px";
        this.zoomed_out_width = "250px";
        this.zoomed_out_height = "50px";
        this.zoomed_status = false;
        this.idx = measure_idx;
        this.id = "measure_id_"+String(this.idx);
        this.timeSignature = measure_ts;
        this.ts_numerator = [];
        this.ts_denominator = [];
        // inner div that includes spans where chord symbols are shown for each beat
        this.chords_indicator_div = document.createElement('div');
        // this.inner_span = document.createElement("span");
        // this.inner_span.textContent = "Xx";
        // define div
        this.my_div = document.createElement("div");
        this.my_div.style.width = this.zoomed_out_width;
        this.my_div.style.height = this.zoomed_out_height;
        this.my_div.style.background = "grey";
        this.my_div.style.color = "white";
        this.my_div.append( this.chords_indicator_div );
        // this.my_div.append( this.inner_span );
        this.my_div.id = this.id;
        // console.log("this.my_div.id: ", this.my_div.id);
        this.my_div.classList.add("bar_div");
        // this.my_div.transition = "all .5s linear";
        document.getElementById(host_div_id).appendChild( this.my_div );

        // a div that will host all dropdown divs
        this.dd_host_div = document.createElement("div");
        this.dd_host_div.style.height = "162px";
        this.dd_host_div.id = 'dd_host_m'+String(this.idx);
        this.dd_host_div.style.background = "white";
        this.dd_host_div.style.color = "black";
        this.my_div.appendChild( this.dd_host_div );

        // fixing beat divs according to time signature of measure
        this.beat_divs = [];
        if (measure_ts == '4/4'){
            this.ts_numerator = 4;
            this.ts_denominator = 4;
            for (var i=0; i<4; i++){
                this.beat_divs.push( new BeatDiv(this, this.idx, i ));
                var tmpspan = document.createElement("span");
                tmpspan.innerHTML = '||';
                tmpspan.id = "m_" + String(this.idx) + "_chord_span_id_" + String(i);
                if (i%2 == 0){
                    tmpspan.style.fontSize = "xx-large";
                }else{
                    tmpspan.style.fontSize = "medium";
                }
                this.chords_indicator_div.append( tmpspan );
            }
        }else if (measure_ts == '3/4'){
            this.ts_numerator = 3;
            this.ts_denominator = 4;
            for (var i=0; i<3; i++){
                this.beat_divs.push( new BeatDiv(this, this.idx, i ));
                var tmpspan = document.createElement("span");
                tmpspan.innerHTML = '||';
                tmpspan.id = "m_" + String(this.idx) + "_chord_span_id_" + String(i);
                if (i == 0){
                    tmpspan.style.fontSize = "xx-large";
                }else{
                    tmpspan.style.fontSize = "medium";
                }
                this.chords_indicator_div.append( tmpspan );
            }
        }else{
            console.log("UNKNOWN time signature");
        }
        // console.log('this.beat_divs: ', this.beat_divs);
        // put beats on hosting div
        for (var i=0; i<this.beat_divs.length; i++){
            this.dd_host_div.append( this.beat_divs[i].dd_div );
        }
        $(this.dd_host_div).hide();
        // console.log('this.dd_host_div: ', this.dd_host_div);
        // placebo done button
        this.done_button = document.createElement('button');
        this.done_button.innerHTML = 'Done';
        this.my_div.appendChild(this.done_button);
        $(this.done_button).hide();
        // functions
        var that = this;
        this.my_div.onclick = function(){
            // console.log("Clicked on: ", that.my_div.id);
            // make sure that all others get zoomed out
            main_zoom_out_all_except(that.my_div.id);
            that.change_zoom();
        };
        this.set_zoom_status = function(z){
            that.zoomed_status = z;
            if (z){
                document.getElementById(that.my_div.id).style.width = that.zoomed_in_width;
                document.getElementById(that.my_div.id).style.height = that.zoomed_in_height;
                that.my_div.style.background = "green";
                // that.dd_div.style.display = "block";
                $(that.dd_host_div).show(500);
                $(that.done_button).show(500);
                // $(that.dd_div).show(500);
            }else{
                document.getElementById(that.my_div.id).style.width = that.zoomed_out_width;
                document.getElementById(that.my_div.id).style.height = that.zoomed_out_height;
                that.my_div.style.background = "grey";
                // that.dd_div.style.display = "none";
                $(that.dd_host_div).hide(500);
                $(that.done_button).hide(500);
                // $(that.dd_div).hide(500);
            }
        }

        this.change_zoom = function(){
            that.zoomed_status = !that.zoomed_status;
            that.set_zoom_status( that.zoomed_status );
        }
        this.update_label_in_measure = function(){
            for (var i=0; i<that.beat_divs.length; i++){
                document.getElementById( "m_" + String(that.idx) + "_chord_span_id_" + String(i) ).innerHTML = that.beat_divs[i].chord_string;
            }
            // var tmpString = '';
            // for (var i=0; i<that.beat_divs.length; i++){
            //     tmpString += that.beat_divs[i].chord_string;
            // }
            // that.inner_span.textContent = tmpString
        }
        for (var i=0; i<this.beat_divs.length; i++){
            this.beat_divs[i].compose_chord_string();
        }
        this.update_label_in_measure();
    }
}

class BeatDiv{
    constructor(measure_object, measure_idx, beat_idx){
        // console.log('creating beat div');
        this.idx = beat_idx;
        this.id = "m_"+String(measure_idx)+"_beat_id_"+String(beat_idx);
        this.measure_idx = measure_idx;
        this.measure_object = measure_object;

        // string interpretation of the beat chord
        this.chord_string = ' _';
        // dropdown menus for chords and types
        // first create the div the hosts the two dropdown menus
        this.dd_div = document.createElement("div");
        this.dd_div.style.background = "white";
        this.dd_div.style.color = "black";
        // this.dd_div.innerHTML = "lol";
        this.dd_div.id = "dd_"+this.id;
        // this.dd_div.style.height = "162px";
        // measure_object.dd_host_div.append( this.dd_div );
        // this.dd_div.style.display = "none";
        // $(this.dd_div).hide();
        // make span with info 
        this.beatSpan = document.createElement("span");
        // this.beatSpan.textContent = "beat "+String(this.idx+1) + ": ";
        this.beatSpan.innerHTML = "beat "+String(this.idx+1) + ": ";
        this.beatSpan.style.fontSize = 'medium'
        this.dd_div.appendChild(this.beatSpan);
        // make dropdown menus
        // root notes
        this.roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        if (measure_idx != 0 || this.idx > 0){
            this.roots.push('Same');
        }
        this.rootSelect = document.createElement("select");
        for (var i = 0; i < this.roots.length; i++) {
            var option = document.createElement("option");
            option.value = this.roots[i];
            option.text = this.roots[i];
            this.rootSelect.appendChild(option);
        }
        if (this.idx > 0){
            this.rootSelect.value = 'Same';
        }
        this.dd_div.appendChild(this.rootSelect);
        this.types = [' ', 'm', 'm7', String('\u25B5'), '7', String('\u2205'), '+'];
        if (measure_idx != 0 || this.idx > 0){
            this.types.push('Same');
        }
        this.typeSelect = document.createElement("select");
        for (var i = 0; i < this.types.length; i++) {
            var option = document.createElement("option");
            option.value = this.types[i];
            option.text = this.types[i];
            this.typeSelect.appendChild(option);
        }
        if (this.idx > 0){
            this.typeSelect.value = 'Same';
            // this.typeSelect.value = this.types.length - 1;
        }else{
            this.typeSelect.value = this.types[0];
            // this.typeSelect.value = 0;
        }
        this.dd_div.appendChild(this.typeSelect);

        // functions
        var that = this;
        this.rootSelect.onclick = function(){
            that.measure_object.zoomed_status = !measure_object.set_zoom_status;
        };
        this.rootSelect.onchange = function(){
            if (that.typeSelect.value == 'Same'){
                that.typeSelect.value = that.types[0];
            }
            that.update_chord_string();
        };
        this.typeSelect.onclick = function(){
            that.measure_object.zoomed_status = !measure_object.set_zoom_status;
        };
        this.typeSelect.onchange = function(){
            if (that.rootSelect.value == 'Same'){
                that.rootSelect.value = that.roots[0];
            }
            that.update_chord_string();
        };
        this.compose_chord_string = function(){
            if (that.rootSelect.value == 'Same' || that.typeSelect.value == 'Same'){
                that.typeSelect.value = 'Same';
                that.rootSelect.value = 'Same';
                that.chord_string = ' _';
            }else{
                if ( that.typeSelect.value == String('\u25B5') || that.typeSelect.value == String('\u2205') || '+' ){
                    if ( that.typeSelect.value == String('\u2205') ){
                        if ( ( that.idx != 0 && measure_object.timeSignature == '3/4' ) || ( that.idx%2 != 0 && measure_object.timeSignature == '4/4' ) ) {
                            that.chord_string = ' ' + that.rootSelect.value + that.typeSelect.value.fontsize(1).sup();
                        }else{
                            that.chord_string = ' ' + that.rootSelect.value + that.typeSelect.value.fontsize(3).sup();
                        }
                    }else{
                        that.chord_string = ' ' + that.rootSelect.value + that.typeSelect.value.sup();
                    }
                }else{
                    that.chord_string = ' ' + that.rootSelect.value + that.typeSelect.value;
                }
            }
        }
        this.assign_root_and_type = function(r,t){
            that.rootSelect.value = r;
            that.typeSelect.value = t
            that.compose_chord_string();
            stop_metronome();
        }
        this.update_chord_string = function(){
            that.compose_chord_string();
            that.measure_object.update_label_in_measure();
            stop_metronome();
        }
        // this.compose_chord_string();
    }
}