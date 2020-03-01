class Metronome{

    constructor(audioManager){
        // var audioContext = null;
        this.audioManager = audioManager;
        this.oscObject = new OscillatorClass(audioManager.audioContext, 440.0);
        this.audioManager.receiveAudioFromNode(this.oscObject.gainNode);
        this.isPlaying = false;      // Are we currently playing?
        this.makeSound = false;
        this.oddEvenAll = 'even';
        this.toolIsPlaying = false;
        this.startTime = 0.0;              // The start time of the entire sequence.
        this.current16thNote;        // What note is currently last scheduled?
        this.tempo = 120.0;          // tempo (in beats per minute)
        this.lookahead = 25.0;       // How frequently to call scheduling function 
                                    //(in milliseconds)
        this.scheduleAheadTime = 0.01;    // How far ahead to schedule audio (sec)
                                    // This is calculated from lookahead, and overlaps 
                                    // with next interval (in case the timer is late)
        this.nextNoteTime = 0.0;     // when the next note is due.
        this.currentNoteTime = 0.0;  // the time the current note has started.
        this.tatumInterval = 0.0;
        this.noteResolution = 16;     // 0 == 16th, 1 == 8th, 2 == quarter note
        this.noteLength = 0.05;      // length of "beep" (in seconds)
        this.canvas;                 // the canvas element
        this.canvasContext;          // canvasContext is the canvas' context 2D
        this.last16thNoteDrawn = -1; // the last "box" we drew on the screen
        this.notesInQueue = [];      // the notes that have been put into the web audio,
                                    // and may or may not have played yet. {note, time}
        this.timerWorker = null;     // The Web Worker used to fire timer messages

        // my adjustments
        this.swing = 0.0;
        this.beat16Length = 16;

        this.bar = 0.0;
        this.beat = 0.0;
        this.sixteenth = 0.0;
        this.tatum = 0.0;

        this.numerator = 4;
        this.denominator = 4;

        // audio clicks
        this.click = true;
        this.smallClick1 = new Audio('./metronome_sounds/metroSmall.wav')
        this.smallClick1.crossOrigin="anonymous";
        this.smallClick2 = new Audio('./metronome_sounds/metroSmall.wav')
        this.smallClick2.crossOrigin="anonymous";
        this.playSmall1 = true;
        this.bigClick = new Audio('./metronome_sounds/metroBig.wav')
        this.bigClick.crossOrigin="anonymous";

        this.smallClick1_source = this.audioManager.audioContext.createMediaElementSource(this.smallClick1);
        this.audioManager.receiveAudioFromNode(this.smallClick1_source);
        this.smallClick2_source = this.audioManager.audioContext.createMediaElementSource(this.smallClick2);
        this.audioManager.receiveAudioFromNode(this.smallClick2_source);
        this.bigClick_source = this.audioManager.audioContext.createMediaElementSource(this.bigClick);
        this.audioManager.receiveAudioFromNode(this.bigClick_source);
        
        this.timerWorker = new Worker("./scripts/metronome_js/metronomeworker.js");

        this.timerWorker.onmessage = (e) => {
            if (e.data == "tick") {
                // console.log("tick!");
                scheduler();
            }
            else if (e.data == "resumeAudioContext"){
                this.audioManager.audioContext.resume().then(() => {
                    console.log('Playback resumed successfully');
                });

            }
            else
                console.log("message: " + e.data);
        };
        
        this.timerWorker.postMessage({"interval":this.lookahead});

        // events
        this.barEvent = new CustomEvent("barEvent", {
            barNum: 0
        });
        this.beatEvent = new CustomEvent("beatEvent", {
            beatNum: 0
        });
        this.eighthEvent = new CustomEvent("eighthEvent", {
            eighthNum: 0
        });
        this.sixteenthEvent = new CustomEvent("sixteenthEvent", {
            sixteenthNum: 0
        });
        this.pulseEvent = new CustomEvent("pulseEvent", {
            pulseNum: 0
        });
        this.timeEvent = new CustomEvent("timeEvent", {
            metroTimeStamp: 0
        });

        // setup events
        this.numeratorEvent = new CustomEvent("numeratorEvent", {
            numerator: 0
        });
        this.denominatorEvent = new CustomEvent("denominatorEvent", {
            denominator: 0
        });
        this.resolutionEvent = new CustomEvent("resolutionEvent", {
            resolution: 0
        });
        this.startedEvent = new CustomEvent("startedEvent", {
            started: true
        });
        this.stoppedEvent = new CustomEvent("stoppedEvent", {
            stopped: true
        });
        this.startedSoundEvent = new CustomEvent("startedSoundEvent", {
            startedSound: true
        });
        this.stoppedSoundEvent = new CustomEvent("stoppedSoundEvent", {
            stoppedSound: true
        });

        var that = this;

        function nextNote() {
            // Advance current note and time by a 16th note...
            var secondsPerBeat = 60.0 / that.tempo;    // Notice this picks up the CURRENT 
                                                // tempo value to calculate beat length.
            // nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time
            that.tatumInterval = 0.25 * secondsPerBeat - Math.pow(-1, 1+that.current16thNote)*that.swing*0.5*0.25*secondsPerBeat;
            that.currentNoteTime = that.nextNoteTime;
            that.nextNoteTime += 0.25 * secondsPerBeat - Math.pow(-1, 1+that.current16thNote)*that.swing*0.5*0.25*secondsPerBeat;
            that.current16thNote++;    // Advance the beat number, wrap to zero
            if (that.current16thNote >= that.beat16Length) {
                that.current16thNote = 0;
                // zero out all other info
                that.beat = 0.0;
                that.sixteenth = 0.0;
                that.tatum = 0.0;
            }
        }

        function setTempo(t){
            that.tempo = t;
            that.tatumInterval = 0.25 * secondsPerBeat - Math.pow(-1, 1+that.current16thNote)*that.swing*0.5*0.25*secondsPerBeat;
        }

        function setSoundOnOff(b){
            that.makeSound = b;
        }

        function scheduleNote( beatNumber, time ) {
            if ( (that.noteResolution==8) && (beatNumber%2) )
                return; // we're not playing non-8th 16th notes
            if ( (that.noteResolution==4) && (beatNumber%4) )
                return; // we're not playing non-quarter 8th notes
            
            // trigger pulse event - pulse has been 0ed out earlier
            that.pulseEvent.pulseNum = that.tatum;
            document.dispatchEvent(that.pulseEvent);
            that.tatum++;
            // console.log('metronome beat number: ', that.beat);
            console.log('metronome beat number: ', beatNumber);
            if (beatNumber % that.beat16Length === 0){    // beat 0 == high pitch
                if ( that.makeSound && !that.oddEvenAll == 'even'){
                    if ( that.click ){
                        that.bigClick.currentTime = 0;
                        that.bigClick.play();
                    }else{
                        that.oscObject.playClick(880.0, time);
                    }
                }
                that.oscObject.playClick(880.0, time);
                // trigger bar event
                console.log('dispatching bar event');
                that.bar++;
                that.barEvent.barNum = that.bar;
                document.dispatchEvent(that.barEvent);
                // trigger beat event - beat value has been 0ed out earlier
                that.beatEvent.beatNum = that.beat;
                document.dispatchEvent(that.beatEvent);
            }else if (beatNumber % 4 === 0 ){    // quarter notes = medium pitch
                if (that.makeSound && !that.oddEvenAll == 'even'){
                    if (that.click){
                        that.bigClick.currentTime = 0;
                        that.bigClick.play();
                    }else{
                        that.oscObject.playClick(440.0, time);
                    }
                }
                that.oscObject.playClick(440.0, time);
                // if denominator is 4, here's the beat
                // if (that.denominator == 4){
                that.beat++;
                // trigger beat event
                that.beatEvent.beatNum = that.beat;
                document.dispatchEvent(that.beatEvent);
                // }
            }else{                        // other 16th notes = low pitch
                if ( that.makeSound && ( (that.oddEvenAll == 'odd' && (beatNumber+1) % 2) || (that.oddEvenAll == 'even' && beatNumber % 2 === 0) || that.oddEvenAll == 'all' ) ){
                    if (that.click){
                        if(that.playSmall1){
                            if (that.makeSound){
                                that.smallClick1.currentTime = 0;
                                that.smallClick1.play();
                            }
                            that.playSmall1 = false;
                        }else{
                            if (that.makeSound){
                                that.smallClick2.currentTime = 0;
                                that.smallClick2.play();
                            }
                            that.playSmall1 = true;
                        }
                    }else{
                        that.oscObject.playClick(220.0, time);
                    }
                }
            }
            // trigger eighth event
            if (beatNumber%2 == 0){
                that.eighthEvent.eighthNum = beatNumber/2;
                document.dispatchEvent(that.eighthEvent)
            }
            // trigger sixteenth event
            that.sixteenthEvent.sixteenthNum = beatNumber;
            document.dispatchEvent(that.sixteenthEvent);
        }

        function scheduler() {
            // console.log("scheduler",that.audioManager);
            // trigger time event
            that.timeEvent.metroTimeStamp = that.audioManager.getCurrentTime();
            // console.log("that.timeEvent.metroTimeStamp",that.timeEvent.metroTimeStamp);
            document.dispatchEvent(that.timeEvent);
            while (that.nextNoteTime < that.audioManager.getCurrentTime() + that.scheduleAheadTime ) {
                scheduleNote( that.current16thNote, that.nextNoteTime-that.audioManager.getCurrentTime() );
                nextNote();
            }
        }

        function clickChange() {
            that.click = !that.click;
            // console.log(click)
            if (that.click) {
                return "bleep";
            } else {
                return "click";
            }
        }

        function setClick(idx){
            // console.log('click: ', idx);
            if (that.idx == 0){
                that.click = false;
            }else{
                that.click = true;
            }
        }
        function computeBeat16Length(){
            that.beat16Length = that.numerator*(16.0/that.denominator);
            console.log('in metro - beat16Length: ', that.beat16Length);
        }

        this.setPlayStop = function(b) {
            if (b){ // user presses play
                if (that.isPlaying){ // if metronome already plays, it should start making sound
                    that.makeSound = true;
                    document.dispatchEvent(that.startedSoundEvent);
                }else{ // if metronome doesn't play, it should start timing and playing sound
                    that.isPlaying = true;
                    document.dispatchEvent(that.startedEvent);
                    that.makeSound = true;
                    document.dispatchEvent(that.startedSoundEvent);
                    that.startTime = that.audioManager.getCurrentTime();
                    that.bar = 0.0;
                    that.beat = 0.0;
                    that.sixteenth = 0.0;
                    that.tatum = 0.0;
                    that.current16thNote = 0;
                    that.nextNoteTime = that.audioManager.getCurrentTime();
                    that.currentNoteTime = that.audioManager.getCurrentTime();
                    that.timerWorker.postMessage("start");
                    console.log("Starting metronome:", that.isPlaying);
                }
            }else{ // if user plays stop
                if (that.toolIsPlaying){ // if tool plays, metronome cannot stop the tool
                    that.makeSound = false;
                    document.dispatchEvent(that.stoppedSoundEvent);
                }else{ // if tool is not making sound, the metronome should stop
                    that.isPlaying = false;
                    document.dispatchEvent(that.stoppedEvent);
                    that.makeSound = false;
                    document.dispatchEvent(that.stoppedSoundEvent);
                    that.timerWorker.postMessage("stop");
                }
            }
        }

        this.toolSendsPrecountPlayStop = function(b){
            that.toolIsPlaying = b;
            if(b){
                
            }else{
                that.toolSendsPlayStop(b)
            }
        }

        this.toolSendsPlayStop = function(b) {
            that.toolIsPlaying = b;
            if (b){
                // if metronome not running already start, else do nothing
                if (!that.isPlaying){
                    that.isPlaying = true;
                    that.current16thNote = 0;
                    that.nextNoteTime = that.audioManager.getCurrentTime();
                    that.currentNoteTime = that.audioManager.getCurrentTime();
                    that.timerWorker.postMessage("start");
                    console.log("Starting metronome:", that.isPlaying);
                    document.dispatchEvent(that.startedEvent);
                }
            }else{
                // if metronome is running stop
                if (that.isPlaying){
                    that.timerWorker.postMessage("stop");
                    document.dispatchEvent(that.stoppedEvent);
                    that.isPlaying = false;
                    that.makeSound = false;
                }
            }
        }
        this.setSoundOnOff = function(b){
            that.makeSound = b;
            if (b){
                document.dispatchEvent(that.startedSoundEvent);
            }else{
                document.dispatchEvent(that.stoppedSoundEvent);
            }
        }
        this.setTempo = function(t){
            that.tempo = t;
            var secondsPerBeat = 60.0 / that.tempo;
            that.tatumInterval = 0.25 * secondsPerBeat - Math.pow(-1, 1+that.current16thNote)*that.swing*0.5*0.25*secondsPerBeat;
        }

        this.setNumerator = function(n){
            that.numerator = n;
            computeBeat16Length();
            console.log('in metro - numerator: ', n);
            // trigger numerator event
            that.numeratorEvent.numerator = that.numerator;
            document.dispatchEvent(that.numeratorEvent);
        }
        this.setDenominator = function(d){
            that.denominator = d;
            computeBeat16Length();
            console.log('in metro - denominator: ', d);
            // trigger denominator event
            that.denominatorEvent.denominator = that.denominator;
            document.dispatchEvent(that.denominatorEvent);
        }

        this.setResolution = function(r){
            that.noteResolution = r;
            console.log('in metro - resolution: ', r);
            // trigger denominator event
            that.resolutionEvent.denominator = that.resolution;
            document.dispatchEvent(that.resolutionEvent);
        }
    }
}