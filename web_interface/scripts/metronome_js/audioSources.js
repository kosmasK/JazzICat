class OscillatorClass{

	constructor(ctx, freq){
		this.context = ctx;
		this.sourceNode = ctx.createOscillator();
		this.freq = freq;
		this.sourceNode.frequency.value = freq;
		this.isPlaying = false;
		this.gainNode = ctx.createGain();
		this.gainNode.gain.setValueAtTime(0, 0);
		// this.gainedSource = this.gain.connect(this.sourceNode);
		this.sourceNode.connect(this.gainNode);
		this.sourceNode.start(0);
	}

	setFrequency(freq){
		this.freq = freq;
		this.sourceNode.frequency.value = freq;
	}

	toggleStartStop(){
		if (this.isPlaying) {
			// this.sourceNode.stop(0);
			this.gainNode.gain.linearRampToValueAtTime(0,this.context.currentTime + 0.05);
			this.isPlaying = false;
			// this.sourceNode = null;
		}else{
			// this.sourceNode = this.context.createOscillator();
			// this.sourceNode.frequency.value = this.freq;
			// // this.sourceNode.connect(this.context.destination);
			// this.sourceNode.start(0);
			this.gainNode.gain.linearRampToValueAtTime(1,this.context.currentTime + 0.05);
			this.isPlaying = true;
		}
	}
	playClick(freq, startTime){
		this.freq = freq;
		this.sourceNode.frequency.value = freq;
		this.gainNode.gain.linearRampToValueAtTime(0.3,this.context.currentTime+0.05);
		this.gainNode.gain.linearRampToValueAtTime(0,this.context.currentTime+0.06);

		// this.sourceNode = this.context.createOscillator();
		// this.freq = freq;
		// this.sourceNode.frequency.value = freq;
		// this.sourceNode.start(startTime);
		// this.sourceNode.stop(startTime + duration);
	}
	oscillatorStartLow(){

	}
	playNote(freq, startTime, duration){
		// var ct = this.context.currentTime;
		var ct = startTime + this.context.currentTime;
		var max_vol = 0.2
		var sustainVal = 0.5*max_vol;
		var attack = 0.05;
		var decay = 0.1;
		var sustain = 0.3;
		var smooth_trans_time = 0.05;
		while (duration < attack+decay+sustain + 0.01){
			attack = attack/2.0;
			decay = decay/2.0;
			sustain = sustain/2.0;
		}
		var release = duration - attack - decay - sustain;
		// console.log(ct, attack, decay, sustain, release);
		this.freq = freq;
		this.sourceNode.frequency.value = freq;
		// this.gainNode.gain.setValueAtTime(0, 0);
		this.gainNode.gain.cancelScheduledValues( ct );
		this.gainNode.gain.linearRampToValueAtTime(0,smooth_trans_time+ct);
		this.gainNode.gain.linearRampToValueAtTime(max_vol,smooth_trans_time+ct+attack);
		this.gainNode.gain.linearRampToValueAtTime(sustainVal,smooth_trans_time+ct+attack+decay);
		this.gainNode.gain.linearRampToValueAtTime(sustainVal,smooth_trans_time+ct+attack+decay+sustain);
		this.gainNode.gain.linearRampToValueAtTime(0,smooth_trans_time+ct+attack+decay+sustain+release);
		// console.log(this.gainNode.gain);
		// console.log(this.sourceNode);
	}

}

class MicInClass{

	constructor(ctx){
		this.context = ctx;
		this.sourceNode = null;
		var that = this;
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {
		  /* use the stream */
		  that.sourceNode = that.context.createMediaStreamSource(stream);
		}).catch(function(err) {
		  /* handle the error */
		  console.log("mic error...");
		});
		// this.getUserMedia(
		//     	{
		//             "audio": {
		//                 "mandatory": {
		//                     "googEchoCancellation": "false",
		//                     "googAutoGainControl": "false",
		//                     "googNoiseSuppression": "false",
		//                     "googHighpassFilter": "false"
		//                 },
		//                 "optional": []
		//             },
		//         },
		//         function(stream){
		//         	console.log("sourceNode - in da callback1: ", this.sourceNode);
		//         	that.sourceNode = that.context.createMediaStreamSource(stream);
		//         	console.log("sourceNode - in da callback2: ", this.sourceNode);
		//         });
		// console.log("sourceNode - outside da callback2: ", this.sourceNode);
		this.isPlaying = false;
	}
	
	getUserMedia(dictionary, callback) {
	    try {
	        navigator.getUserMedia = 
	        	navigator.getUserMedia ||
	        	navigator.webkitGetUserMedia ||
	        	navigator.mozGetUserMedia;
	        navigator.getUserMedia(dictionary, callback, error);
	    } catch (e) {
	        alert('getUserMedia threw exception :' + e);
	    }
	}

	toggleStartStop(){
		// console.log("isPlaying: ", this.isPlaying);
		if (this.isPlaying) {
			// this.sourceNode.stop(0);
			// this.sourceNode.disconnect();
			this.isPlaying = false;
			// this.sourceNode = null;
		}else{
			var that = this;
			// this.getUserMedia(
			//     	{
			//             "audio": {
			//                 "mandatory": {
			//                     "googEchoCancellation": "false",
			//                     "googAutoGainControl": "false",
			//                     "googNoiseSuppression": "false",
			//                     "googHighpassFilter": "false"
			//                 },
			//                 "optional": []
			//             },
			//         },
			//         function(stream){
			//         	console.log("sourceNode - in da callback1: ", this.sourceNode);
			//         	that.sourceNode = that.context.createMediaStreamSource(stream);
			//         	console.log("sourceNode - in da callback2: ", this.sourceNode);
			//         });
			// console.log("sourceNode - outside da callback2: ", this.sourceNode);
			this.isPlaying = true;
		}
	}

}


class AudioFileClass{

	constructor(ctx, file_name){
		this.context = ctx;
		this.sourceNode = {};
		this.file_name = file_name;
		this.isPlaying = false;
		// this.theBuffer = {};

		this.request = new XMLHttpRequest();
		this.request.open("GET", file_name, true);
		this.request.responseType = "arraybuffer";
		this.myBuffer = [];
		this.sourceNode = this.context.createBufferSource();
		this.sourceNode.outNodes = [];
		var that = this;

		this.request.onload = function() {
		  that.context.decodeAudioData( that.request.response, function(buffer) { 
		    	// parent.theBuffer = buffer;
		    	that.myBuffer = buffer;
			} );
		}
		this.request.send();
	}

	toggleStartStop(){

		if (this.isPlaying) {
			//console.log('stops');
			this.sourceNode.stop(0);
			this.isPlaying = false;
			// this.sourceNode = null;
		}else{
			var outNodes = this.sourceNode.outNodes;
			// var outNodes = [];
			// console.log("this.sourceNode -- 1: ", this.sourceNode);
			this.sourceNode = this.context.createBufferSource();
			this.sourceNode.outNodes = outNodes;
			// console.log("this.sourceNode -- 2: ", this.sourceNode);
			for (var i=0;i<this.sourceNode.outNodes.length;i++){				
				this.sourceNode.connect(outNodes[i]);
			}
			// this.sourceNode.buffer = parent.theBuffer;
			this.sourceNode.buffer = this.myBuffer;
    		this.sourceNode.loop = false;
			// this.sourceNode.connect(this.context.destination);
			this.sourceNode.start(0);
			this.isPlaying = true;
			// console.log("this.sourceNode -- 3: ", this.sourceNode);
		}
	}

}
