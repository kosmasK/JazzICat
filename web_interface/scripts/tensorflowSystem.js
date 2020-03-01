// Human
// input = [16x20]
// [[,]]
// 0 -> beat
// 1 -> melody (P0) (solo)
// 2 -- 19 -> chord_info

// Bot
// input = [16x21]
// [[,]]
// 0 -> beat
// 1 -> melody (P0) (solo)
// 2 -> harmony (p1) (accompaniment)
// 3 -- 20 -> chord_info

// default silence in p0 = 128 and not 0
// default silence in p1 = 0 and not 128

class tensorflowSystem{
	
	constructor(path_hum, path_bot, dict){
		
		this.path_hum = path_hum;
		this.path_bot = path_bot;

		this.model_hum = "human";
		this.model_bot = "bot";

		this.dict = dict;

		this.seed_melody = new Array(16).fill(0);
		
		if (this.path_hum) this.load_model(path_hum, this.model_hum);
		if (this.path_bot) this.load_model(path_bot, this.model_bot);

		// this.seed_input_tensor = tf.tensor();
	}


	async load_model(path, mod) {
		const model = await tf.loadLayersModel(path);
		if (mod == "human"){
			console.log("Human model loaded: ",model);
			this.model_hum = model;
			// console.log("human model:",this.model_hum);

		} 
		else if (mod == "bot"){
			console.log("Bot model loaded: ",model);
			this.model_bot = model;
			// console.log("bot model:",this.model_bot);
		}

		this.checkReadyToRun();
	}

	checkReadyToRun(){

		if ((this.model_hum != "human") && (this.model_bot != "bot")){
			console.log("Ready to run!!!");
			make_inputs_and_run_init();
		}
		else{
			console.log("Still not ready to run.....");
			return;
		}
		
	}

	classToNotes(cl){

		return dict[cl];
	}

	infer_human(){

	}

	infer_bot(){

	}


}