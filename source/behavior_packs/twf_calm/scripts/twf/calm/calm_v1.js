import * as mc from "@minecraft/server";
import * as mcui from "@minecraft/server-ui";
import * as twfui from "./libs/twfui";
import * as twfguide from "./libs/twfcalmguide";
import patterns from "./libs/twfcalmpatterns";
import bonus_items from "./libs/twfcalmbonus";

//   @TheWorldFoundry

/*  PROJECT NAMESPACE  */
const studio = 'twf'
const project = 'calm'
const ns = studio+"_"+project+":"

// These are passed into the guide use method because we may want to replenish the player
const static_items = [
	["twf_calm:life_controller_spawn_egg",1],
	["twf_calm:cell",64],
	["twf_calm:life_builder_spawn_egg",1],
	["twf_calm:life_destroyer_spawn_egg",1],
	["twf_calm:life_randomiser_spawn_egg",1],
	["twf_calm:poster_spawn_egg",1],
	["twf_calm:life_converter_spawn_egg",1],
	["twf_calm:flight",1],
	["twf_calm:sword_of_life",1]
]

const static_blocknames = [
	"coral_block",
	"white_concrete",
	"red_stained_glass",
	"stonebrick",
	"mud_brick_wall",
	"birch_fence",
	"sand",
	"tnt"
]

let project_global_settings = {
	DEBUG : false,

	LT_SIMULATION_RADIUS: 8,
	INITIALISE_FIELD_ARRAY : false,
	
	LT_BLOCK_BACKLOG_LIMIT: 200,
	LT_TIME_BUDGET_LIMIT: 4,
	LT_WATCHDOG_BACKOFF: 3,
	LT_RUN_EVERY: 7,
	
	LT_LIFE_LONELY: 2,
	LT_LIFE_CROWDED: 3,
	LT_LIFE_BORN: 3,
	
	LT_PARTICLES_SETTING: true,
	LT_SOUNDS_SETTING: true,
	LT_SWORD_BONUS: 3000,
	LT_BLOCK_SETTING: 0,
	PLAYER_SETTING_KEYS: {
		LT_SOUNDS_SETTING: 'twf_calm_setting_sounds',
		LT_FLIGHT_SETTING: 'twf_calm_setting_flight',
		LT_CAGE_SETTING: 'twf_calm_setting_cage',
		LT_EQUIP_SETTING: 'twf_calm_setting_equip'
	}
}

// Check and initialise the world global settings if not already set 20240610
// If the global property is present on the world, use that value instead of the default above.
function initialise_global_defaults() {
	try {
		for(let prop in project_global_settings) {
			// mc.world.sendMessage(prop);
			if(prop !== "PLAYER_SETTING_KEYS") {
				let curr_val = mc.world.getDynamicProperty(prop);
				// mc.world.sendMessage(prop+"="+String(curr_val))
				if( curr_val === undefined) {
					mc.world.setDynamicProperty(prop, project_global_settings[prop]); // Initialise
				} else {  // Replace script defaults with world value
					project_global_settings[prop] = curr_val; // Initialise
				}
			}
		}
	} catch(error) {
		// mc.world.sendMessage(error+" "+String(error.stack));
		// pass
	}
}

initialise_global_defaults();

//  The forms layout metadata is here because the settings scope is at the game loop level.
const forms_control_guide = {
	cache : {},
	start : "contents",
	
	// Dynamic button based content forms are generated here in the guide helper import
	
	settings : {
		type : 'controls',
		cache : false,
		title : ns+"guide_form_settings_title",		
		controls: [
			['global', 'bool', "LT_PARTICLES_SETTING", ns+"guide_form_settings_global_particle", project_global_settings["LT_PARTICLES_SETTING"]],
			['player', 'bool', project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"], ns+"guide_form_settings_sound", true],
			['player', 'bool', project_global_settings["PLAYER_SETTING_KEYS"]["LT_FLIGHT_SETTING"], ns+"guide_form_settings_flight", true],
			['player', 'bool', project_global_settings["PLAYER_SETTING_KEYS"]["LT_CAGE_SETTING"], ns+"guide_form_settings_cage", false],
			['player', 'bool', project_global_settings["PLAYER_SETTING_KEYS"]["LT_EQUIP_SETTING"], ns+"guide_form_settings_equip", true],
			['global', 'select', "LT_BLOCK_SETTING", ns+"guide_form_settings_block", 0, static_blocknames],
			['global', 'slider', "LT_SWORD_BONUS", ns+"guide_form_settings_bonus", project_global_settings["LT_SWORD_BONUS"], 1000, 10000, 1000]
		],
		nav : "contents"
	},
	performance : {
		type : 'controls',
		cache : false,
		title : ns+"guide_form_performance_title",		
		controls: [
		//	['global', 'bool', "DEBUG", ns+"guide_form_settings_debug", project_global_settings["DEBUG"]],
			
			['global', 'slider', "LT_SIMULATION_RADIUS", ns+"guide_form_settings_simulation_radius", project_global_settings["LT_SIMULATION_RADIUS"], 4, 32, 1],
			['global', 'bool', "INITIALISE_FIELD_ARRAY", ns+"guide_form_settings_initialise_field", project_global_settings["INITIALISE_FIELD_ARRAY"]],
			
			['global', 'slider', "LT_BLOCK_BACKLOG_LIMIT", ns+"guide_form_settings_block_backlog", project_global_settings["LT_BLOCK_BACKLOG_LIMIT"], 10, 200, 10],
			['global', 'slider', "LT_TIME_BUDGET_LIMIT", ns+"guide_form_settings_time_budget_limit", project_global_settings["LT_TIME_BUDGET_LIMIT"], 1, 4, 1],
			['global', 'slider', "LT_WATCHDOG_BACKOFF", ns+"guide_form_settings_time_backoff", project_global_settings["LT_WATCHDOG_BACKOFF"], 0, 8, 1],
			['global', 'slider', "LT_RUN_EVERY", ns+"guide_form_settings_time_run_every", project_global_settings["LT_RUN_EVERY"], 1, 20, 1],
		],
		nav : "contents"
	},
	life_rules : {
		type : 'controls',
		cache : false,
		title : ns+"guide_form_life_rules_title",		
		controls: [
			['global', 'slider', "LT_LIFE_LONELY", ns+"guide_form_settings_life_lonely", project_global_settings["LT_LIFE_LONELY"], 0, 8, 1],
			['global', 'slider', "LT_LIFE_CROWDED", ns+"guide_form_settings_life_crowded", project_global_settings["LT_LIFE_CROWDED"], 0, 8, 1],
			['global', 'slider', "LT_LIFE_BORN", ns+"guide_form_settings_life_born", project_global_settings["LT_LIFE_BORN"], 0, 8, 1]
		],
		nav : "contents"
	}
};

twfguide.init_forms(forms_control_guide, ns);

if(project_global_settings["DEBUG"]) mc.world.sendMessage(JSON.stringify(forms_control_guide, undefined, 2));



const BOOK_ID = "twf_calm:guide"
const LT_NAME_GUIDE = "§l§eThe Little Book of C.A.L.M.§r"

twfui.show_forms_on_item_use({
	itemTypeId: "twf_calm:guide",
	forms_control: forms_control_guide,
	project_global_settings: project_global_settings,
	sound_open: "twf.calm.book",
	sound_flag: "LT_SOUNDS_SETTING",
	item_top_up: static_items,
	item_top_up_flag: "LT_EQUIP_SETTING"
});


function give_spawn_item(player, itemTypeId, qty, name) {
	const initialised_on_spawn = itemTypeId + '_init';	
	if(player.getDynamicProperty(initialised_on_spawn) === undefined) {
		var item = new mc.ItemStack(itemTypeId, qty);
		item.nameTag = name;
		player.dimension.spawnItem(item, player.location);
		player.setDynamicProperty(initialised_on_spawn, 1);
		player.setDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"], true);
		player.setDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_FLIGHT_SETTING"], true);
		player.setDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_EQUIP_SETTING"], true);
		player.setDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_BLOCK_SETTING"], 0);
	}
};

mc.world.afterEvents.playerSpawn.subscribe(event => {
	const players = mc.world.getPlayers( { playerId: event.playerId } );
	for ( let player of players ) {
		give_spawn_item(player, BOOK_ID, 1, LT_NAME_GUIDE);		
	}
});

//  Block handling specific simulation debugs
const debug = false
const performance_debug = debug
const block_placement_debug = false;
const entity_placement_debug = false;

function send_alert(msg, data) {
	if(debug) {
		mc.world.sendMessage(String(msg) + String(data));
	};
};

const hints = [
	'Pattern created',
	'Life finds a way',
	'Use the Life Controller',
	'By your command.',
	'Standing by...',
	'Make it so.',
	'Eureka!',
	'Tremendous',
	'Fantastic'

];

const dimension_overworld = mc.world.getDimension("overworld");
const dimension_nether = mc.world.getDimension("nether");
const dimension_the_end = mc.world.getDimension("the_end");
const dimensions = [ dimension_overworld,
					 dimension_nether,
					 dimension_the_end
					];

//const update_every = 7;
//const update_every2 = 11;
//const update_every3 = 13;
const update_glider_move = 25;
let iteration = 0
const block_cell = mc.BlockPermutation.resolve("twf_calm:cell")
const block_air = mc.BlockPermutation.resolve("minecraft:air")

const time_budget_minimum = 1;
let iteration_update = 0;
let initialised = false

let cell_count = 0
let cell_count_target = project_global_settings["LT_SWORD_BONUS"];

let global_watchdog_backoff = 0;
let global_watchdog_runlong_count = 0;

const block_backlog = new Map();

const remove_backlog_on_error = true;
const entity_backlog = new Map();
const entity_backlog_limit = 32;
let array_size = project_global_settings["LT_SIMULATION_RADIUS"]*2+1;

let field_frames = [new Array(array_size * array_size), new Array(array_size * array_size)];
let current_frame = 0, next_frame = 1;
let num_neighbours = 0;
// let px, py, cell_state;
// let block, index, block_type;
// const field_origin = {x:-16, y:0, z:-16};
// const simulation_radius = 16;

const alive_state = 1;
const dead_state = 0;
const unknown_state = -1;

let cells = [
				"minecraft:air",
				"twf_calm:cell",
				"twf_calm:cell"
				
];

function add_to_entity_backlog( pos, dimension, entity) {
	let key = String(pos.x)+","+String(pos.y)+","+String(pos.z)
	
	entity_backlog.set( key, {d: dimension, p: pos, e: entity} );	
};

function add_to_block_backlog( pos, dimension, block, overwrite) {
	let key = String(pos.x)+","+String(pos.y)+","+String(pos.z)
	
	block_backlog.set( key, {d: dimension, p: pos, b: block, o: overwrite} );	
};

function game_initialise() {
	try {
		for (let player of mc.world.getAllPlayers()) {
			player.onScreenDisplay.setTitle('C.A.L.M.', {
				stayDuration: 100,
				fadeInDuration: 2,
				fadeOutDuration: 4,
				subtitle: 'by The World Foundry',
			});
		};
		mc.world.sendMessage('C.A.L.M. by TheWorldFoundry');
		mc.world.sendMessage('Setting up...');	


		for (let i = 0; i < cells.length; i++) {
			cells[i] = mc.BlockPermutation.resolve(cells[i]);
		};
		
		
	} catch(error) {
		mc.world.sendMessage(String(error));	
	}
	// dimension_overworld.runCommandAsync('/scoreboard objectives add twf_calm:jig_computer.addon_stats dummy')

};

mc.world.afterEvents.entitySpawn.subscribe(event => {
  try {
	  const { cause, entity } = event
	  if (cause === 'Spawned' && entity.typeId == 'twf_calm:glider') {
		const new_rot = Math.floor(Math.random() * 360)
		entity.setRotation({ x: 0, y: new_rot })
	}
  } catch(error) {
		// not critical if something goes wrong
  }
});

function calc_next_step(current_fields, field_sel, array_size) {
	let current_field = current_fields[(field_sel)%2];
	let next_field = current_fields[(field_sel+1)%2];

	const lonely = project_global_settings["LT_LIFE_LONELY"];
	const crowded = project_global_settings["LT_LIFE_CROWDED"];
	const born = project_global_settings["LT_LIFE_BORN"];

	for (let z = 0; z < array_size; z++) { // for each iteration scan the layer below the stick
		for (let x = 0; x < array_size; x++) {
			let idx = x+z*array_size;
			
			next_field[idx] = unknown_state;

			let num_neighbours = 0;
			for (let dz = -1; dz < 2; dz++) {
				for (let dx = -1; dx < 2; dx++) {
					let px = (x+dx) // %array_size;
					let pz = (z+dz) // %array_size;
					if ((0 <= px) && (px < array_size) && (0 <= pz) && (pz < array_size) && !(dx == 0 && dz == 0)) {
						if (current_field[px+pz*array_size] == alive_state) {
							num_neighbours += 1;
						};
					};
				};
			};
			if ((num_neighbours < lonely) || (num_neighbours > crowded) && (current_field[idx] == alive_state)) {
				next_field[idx] = dead_state; // Dead as the dodo
			}
			else if ((num_neighbours == born) && (current_field[idx] != alive_state)) {
				next_field[idx] = alive_state; // The miracle of nature
			}
			else {
				next_field[idx] = current_field[idx]
			}
			// Use the value of the next frame cell to index the block type
			// Now holding a handle on what is in space we can force the block into it
			// For performance improvements, only change blocks that have been changed			
			// current_field[idx] = next_field[idx]; // mirror
		};
	};

	return next_field;
};


//  Per-position processing
function map_block_from_world_into_field(dimension, world_x, world_y, world_z, field, array_size, field_x, field_z) {
	// Given a world pos, map into the field pos based on the block type in the world
	// mc.world.sendMessage("map_block_from_world_into_field "+String(world_x)+","+String(world_y)+","+String(world_z));
	
	let block = dimension.getBlock( {x: world_x, y:world_y, z:world_z});

	let idx = field_x+field_z*array_size;
	if (block) {
		let matches = block.permutation.matches("twf_calm:cell");
		
		if (matches) {
			field[idx] = alive_state;
		} else {
			field[idx] = dead_state;
		};
	} else {
		field[idx] = unknown_state;
	};	
};

//  Per-position processing
function map_generation_at_a_field_position(field, next_field, array_size, x, z) {
	// Map using the rules of the game of life from the first field into the second at a specific point
	let idx = x + z * array_size;
	next_field[idx] = unknown_state;
	let num_neighbours = 0;
	
	for (let dz = -1; dz < 2; dz++) {
		for (let dx = -1; dx < 2; dx++) {
			let px = (x+dx) // %array_size;
			let pz = (z+dz) // %array_size;
			if ((0 <= px) && (px < array_size) && (0 <= pz) && (pz < array_size) && !(dx == 0 && dz == 0)) {
				if (field[px+pz*array_size] == alive_state) {
					num_neighbours += 1;
				};
			};
		};
	};
	if ((num_neighbours < 2) || (num_neighbours > 3) && (field[idx] == alive_state)) {
		next_field[idx] = dead_state; // Dead as the dodo
	}
	else if ((num_neighbours == 3) && (field[idx] != alive_state)) {
		next_field[idx] = alive_state; // The miracle of nature
	}
	else {
		next_field[idx] = field[idx]
	}
};

//  Per-position processing
function map_field_position_into_world_block(dimension, world_x, world_y, world_z, field, array_size, field_x, field_z) {
	let idx = field_x+field_z*array_size;
	try {
		let state = field[idx];
		let pos = {x: world_x, y:world_y, z:world_z};
		if (state == alive_state) {
			let block = dimension.getBlock( pos );
			if (block.permutation.matches("twf_calm:cell") || block.permutation.matches("minecraft:air")) {
				dimension.getBlock( pos ).setPermutation(cells[1]);
				cell_count ++;
			}
		} else {
			let block = dimension.getBlock( pos );
			if (block.permutation.matches("twf_calm:cell")) {
				dimension.getBlock( pos ).setPermutation(cells[0]);
			}
		}
	} catch(error) {
		// pass
	};
}

function life_controller_iterator(dimension, entity, state, pos, simulation_vert, field, next_field, array_size) {
	// a controller moves through the world changing the cells as it goes.
	// This iterator wakes, checks where it's up to, and goes back to sleep once it exhausts its allotted time budget
	// It halts when it completes the task.
	
	/*	
	if(pos) {
		mc.world.sendMessage("life_controller_iterator "+String(pos.x)+","+String(pos.y)+","+String(pos.z));		 
	}
	if(state) {
		mc.world.sendMessage("life_controller_iterator "+String(state));		 
	}
	*/
	try {
		const simulation_radius = project_global_settings["LT_SIMULATION_RADIUS"];
		let time_budget = 4;
		
		const start_time = new Date().getTime();
		
		// The pos_x, pos_y, pos_z is passed around when the job hibernates

		if(!entity || !entity.isValid) return undefined;  // Nothing to do if invalid or undefined

		do {
			if(state === undefined) {  // Start
				entity.nameTag = "-1";
				pos = {x: entity.location.x - simulation_radius, y: entity.location.y-1, z: entity.location.z - simulation_radius};
				state = "read";
			} else if(state === "layered") {
				pos = {x: entity.location.x - simulation_radius, y: entity.location.y-1, z: entity.location.z - simulation_radius};
				state = "read";
			}
			
			const field_x = pos.x - entity.location.x + simulation_radius;
			const field_z = pos.z - entity.location.z + simulation_radius;

			if(state === "read") {  // Read world
				map_block_from_world_into_field(dimension, pos.x, pos.y, pos.z, field, array_size, field_x, field_z);
			} else if(state === "generate") {  // Apply Life rules
				map_generation_at_a_field_position(field, next_field, array_size, field_x, field_z)
			} else if(state === "write") {  // Write into world
				map_field_position_into_world_block(dimension, pos.x, pos.y, pos.z, next_field, array_size, field_x, field_z)
			}

			//  Move onto the next position we intend to process, and check if we're finished this layer or finished everything
			pos.x++;

			if(pos.x > (entity.location.x + simulation_radius) ) {  // next z
				pos.x = entity.location.x - simulation_radius;
				pos.z++;
				// mc.world.sendMessage(String(pos.z)+String(entity.location.z + simulation_radius));
				
				if(pos.z > (entity.location.z + simulation_radius)) {  // Completed the sweep
					// mc.world.sendMessage("BOO"+String(state));
					// mc.world.sendMessage("Position z"+String(pos.z));
					pos.x = entity.location.x - simulation_radius;  // Reset at field start
					pos.z = entity.location.z - simulation_radius;
					
					if(state === "read") {
						state = "generate";
					}
					else if (state === "generate") {
						state = "write";
					} else if (state === "write") {
						let life_count = parseInt(entity.nameTag)
						life_count++;
						// mc.world.sendMessage("YA "+String(simulation_vert)+" "+String(life_count));
						if (life_count <= simulation_vert) { //  Now work on the next generation
							entity.nameTag = String(life_count);
							state = "layered";  // Restart the state machine
							// mc.world.sendMessage("ZE "+String(entity.nameTag)+" "+String(state));
						} else {
							if(project_global_settings["LT_PARTICLES_SETTING"] === true) entity.runCommandAsync("/particle twf_calm:rainbow_flame ~ ~ ~");
							if(Math.random() > 0.99) {
								entity.runCommandAsync("/summon twf_calm:glider ~ ~1 ~");
								mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:glider', 1);
							};
							mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:controller', 1);
							entity.kill();
							state = "done";
							pos = undefined;
						};
					};
				};
			};
		}
		while(new Date().getTime() - start_time < time_budget);

		let result = [state, pos];
		// mc.world.sendMessage("Returning "+String(state)+" "+String(pos.x)+","+String(pos.y)+","+String(pos.z));
		return result; // Next position to process with the state
	} catch(error) {
	}
	return undefined
};


function game_update_player_flight(players) {
	for (let player of players) {
		let inv = player.getComponent( 'inventory' ).container
		let found = false;
		
		if(player.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_FLIGHT_SETTING"]) === true) {
			let comp = player.getComponent("equippable");
			if(comp) {
				let dev = comp.getEquipment("Chest");
				if(dev) {
					if(dev.typeId.includes('wings')) {
						found = true;
					}
				}
			}
			if(!found) {
				for(let slot = 0; slot < inv.size; slot++) {
					if(inv.getItem(slot)) {
						if(inv.getItem(slot).typeId == "twf_calm:flight") {
							found = true;
						};
					};
				};
			};
		};
		
		if(found) {
			player.addTag("twf_calm_elytra");
		} else {
			player.removeTag("twf_calm_elytra");
		};
	};
};

function game_update_bonus_item(players) {
	if (cell_count > cell_count_target) {
		let b_item = bonus_items[Math.floor(Math.random()*bonus_items.length)];
		cell_count_target += project_global_settings["LT_SWORD_BONUS"];  // Only give once
		let player = players[Math.floor(Math.random()*players.length)];
		player.runCommandAsync("/give @r "+b_item+" 1");
		
		player.onScreenDisplay.setTitle("+"+String(project_global_settings["LT_SWORD_BONUS"])+" CELLS", {
			stayDuration: 100,
			fadeInDuration: 2,
			fadeOutDuration: 4,
			subtitle: "Bonus Life Item!",
		});
		if(player.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"])) player.playSound("random.orb")
		mc.world.sendMessage("A new C.A.L.M. weapon has been gifted at +"+String(project_global_settings["LT_SWORD_BONUS"])+" cells.")
		mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:weapon', 1);
	}
}

let active_controller_state = undefined;
let active_controller = undefined;
let active_controller_pos = undefined;
let active_controller_field = undefined;
let active_controller_next_field = undefined;

function game_update(block_type, entity_controller_type, simulation_vert) {
	const simulation_radius = project_global_settings["LT_SIMULATION_RADIUS"];
	const start_time = new Date().getTime();
	let number_of_entities_processed = 0;
	const players = mc.world.getAllPlayers();

	// Check toggle and initialise the in-memory copy of the life arrays so I don't have to allocate chunks of memory at runtime (which is expensive)
	if(project_global_settings["INITIALISE_FIELD_ARRAY"] === true) {
		array_size = project_global_settings["LT_SIMULATION_RADIUS"] * 2 + 1;
		field_frames = [new Array(array_size * array_size), new Array(array_size * array_size)];  // Swappable fields pre-allocated
		project_global_settings["INITIALISE_FIELD_ARRAY"] = false;  // Clear semaphore
		// mc.world.setDynamicProperty["INITIALISE_FIELD_ARRAY"] = false;  // Don't keep these in sync - I want the arrays initialised on startup.
	};
	
	game_update_player_flight(players);
	
	game_update_bonus_item(players);
	
	
	if (entity_controller_type === "twf_calm:life_randomiser" && number_of_entities_processed === 0) {
		let entity_map = new Map();
		for (let player of players) {
			for (let entity of player.dimension.getEntities( { type: entity_controller_type } )) {
				entity_map.set(entity.id, 
				{dimension: player.dimension, entity: entity, player: player } 
				);
			};
		};		
		// for (let [key, val] of entity_map ) {
		//let e = entity_map[Math.floor(Math.random() * entity_map.length)];
		let items = Array.from(entity_map);

		if(items.length > 0) {		
			let e = items[Math.floor(Math.random() * items.length)]
			let key = e[0];
			let val = e[1];
			{
				let player = val.player;
				let entity = val.entity;
				let dimension = val.dimension;  //  I need to know which dimension we're in so I can work with the blocks correctly
				let px = entity.location.x;
				let py = entity.location.y;
				let pz = entity.location.z;
				
				number_of_entities_processed++;
				
				// Choose, at random, a pattern or approach. Message the player when it's applied
				const pattern = patterns[Math.floor(Math.random()*patterns.length)];
				
				if(player){
					player.onScreenDisplay.setTitle(hints[Math.floor(Math.random()*hints.length)], {
						stayDuration: 100,
						fadeInDuration: 2,
						fadeOutDuration: 4,
						subtitle: pattern[0],
					});
					if(player.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"])) player.playSound("random.pop")
				}
				mc.world.sendMessage(String("Pattern: ") + String(pattern[0]))

				if (pattern[0] != "Random") {
					let pos_z = pattern[2];
					for (let row of pattern[3]) {
						let pos_x = pattern[1];
						for(let col of row) {
							if (col != " " && col != "-") {
								add_to_block_backlog( {x: px+pos_x, y:py, z:pz+pos_z}, dimension, block_type, false )
							};
							pos_x += 1;
						};
						pos_z += 1;
					};
				} else {
					//  Randomise all the cells
					let frequency = Math.floor(Math.random() * 4)+1			
					for (let y = py; y < py+simulation_vert; y++) {
						for (let x = px-(simulation_radius>>3); x <= px+(simulation_radius>>3); x++) {
							for (let z = pz-(simulation_radius>>3); z <= pz+(simulation_radius>>3); z++) {
								let roll = Math.floor(Math.random() * 10)
								if (roll <= frequency) {
									add_to_block_backlog( {x: x, y:y, z:z}, dimension, block_type, false );
								};
							};
						};
					};
				};
				

				if(project_global_settings["LT_PARTICLES_SETTING"] === true) entity.runCommandAsync("/particle twf_calm:ring ~ ~0.5 ~");
				mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:randomiser', 1);
				entity.kill();
			};
		}
		return;
	}
	
	if (entity_controller_type === "twf_calm:life_destroyer" && number_of_entities_processed === 0) {
		let entity_map = new Map();
		for (let player of players) {
			for (let entity of player.dimension.getEntities( { type: entity_controller_type } )) {
				entity_map.set(entity.id, 
				{dimension: player.dimension, entity: entity, player: player} 
				);
			};
		};		
		// for (let [key, val] of entity_map ) {
		//let [key, val] = entity_map[Math.floor(Math.random() * entity_map.length)];
		let items = Array.from(entity_map);
		// mc.world.sendMessage(String(items.length));		
		if(items.length > 0) {		
			let e = items[Math.floor(Math.random() * items.length)]
			let key = e[0];
			let val = e[1];

			{
				number_of_entities_processed++;
				
				if(val.player) {
					if(val.player.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"])) val.player.playSound("mob.endermen.portal");
				}
				let entity = val.entity;
				let dimension = val.dimension;  //  I need to know which dimension we're in so I can work with the blocks correctly
				let px = entity.location.x;
				let py = entity.location.y-1;
				let pz = entity.location.z;
				let stepsize = 4
				for (let i = 0; i < simulation_vert+1; i += stepsize) {
					entity.nameTag = String(i);
					entity.runCommandAsync("/fill "+String(-simulation_radius+px)+" "+String(py+i)+" "+String(-simulation_radius+pz)+
										" "+String(simulation_radius+px+1)+" "+String(py+i-1+stepsize)+" "+String(simulation_radius+pz+1)+" air replace twf_calm:cell");
				};
				if(Math.random() > 0.99) {
					entity.runCommandAsync("/summon twf_calm:glider "+entity.location.x.toString()+" "+(entity.location.y+1).toString()+" "+entity.location.z.toString());
					mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:glider', 1);
				};
				if(Math.random() > 0.9) {
					entity.runCommandAsync("/summon twf_calm:mechanoid "+entity.location.x.toString()+" "+(entity.location.y).toString()+" "+entity.location.z.toString());
					mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:mechanoid', 1);
				};			
				
				if(project_global_settings["LT_PARTICLES_SETTING"] === true) entity.runCommandAsync("/particle twf_calm:ring ~ ~0.5 ~");
				
				entity.kill();
				mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:destroyer', 1);
			};
		}
		return;
	};

	if (entity_controller_type === "twf_calm:life_converter" && number_of_entities_processed === 0) {
		let entity_map = new Map();
		for (let player of players) {
			for (let entity of player.dimension.getEntities( { type: entity_controller_type } )) {
				entity_map.set(entity.id, 
				{dimension: player.dimension, entity: entity, player: player} 
				);
			};
		};		
		let items = Array.from(entity_map);
		if(items.length > 0) {		
			let e = items[Math.floor(Math.random() * items.length)]
			let key = e[0];
			let val = e[1];		
			{			
				number_of_entities_processed++;
				
				if(val.player) {
					if(val.player.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"])) val.player.playSound("mob.endermen.portal")
				}
				let entity = val.entity;
				let dimension = val.dimension;
				let px = entity.location.x;
				let py = entity.location.y-1;
				let pz = entity.location.z;
				let stepsize = 4
				for (let i = 0; i < simulation_vert+1; i += stepsize) {
					entity.nameTag = String(i);
					entity.runCommandAsync("/fill "+String(-simulation_radius+px)+" "+String(py+i)+" "+String(-simulation_radius+pz)+
										" "+String(simulation_radius+px+1)+" "+String(py+i-1+stepsize)+" "+String(simulation_radius+pz+1)+" "+static_blocknames[project_global_settings["LT_BLOCK_SETTING"]]+" replace twf_calm:cell");
				};
				if(Math.random() > 0.99) {
					entity.runCommandAsync("/summon twf_calm:glider "+entity.location.x.toString()+" "+(entity.location.y+1).toString()+" "+entity.location.z.toString());
					mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:glider', 1);
				};
				if(Math.random() > 0.9) {
					entity.runCommandAsync("/summon twf_calm:mechanoid "+entity.location.x.toString()+" "+(entity.location.y).toString()+" "+entity.location.z.toString());
					mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:mechanoid', 1);
				};			
				if(project_global_settings["LT_PARTICLES_SETTING"] === true) entity.runCommandAsync("/particle twf_calm:ring ~ ~0.5 ~");
				mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:converter', 1);
				entity.kill();
			};
		}
		return;
	};

	if (entity_controller_type === "twf_calm:life_builder" && number_of_entities_processed === 0) {
		if(block_backlog.size < project_global_settings["LT_BLOCK_BACKLOG_LIMIT"]) {		
			try {
				let entity_map = new Map();
				for (let player of players) {
					for (let entity of player.dimension.getEntities( { type: entity_controller_type } )) {
						entity_map.set(entity.id, 
						{dimension: player.dimension, entity: entity, player: player} 
						);
					};
				};		
				let items = Array.from(entity_map);
				if(items.length > 0) {		
					const e = items[Math.floor(Math.random() * items.length)]
					const key = e[0];
					const val = e[1];	
					number_of_entities_processed++;
					const entity = val.entity;
					const dimension = val.dimension;  //  I need to know which dimension we're in so I can work with the blocks correctly
					const px = entity.location.x;
					let py = entity.location.y;
					const pz = entity.location.z;
					if(val.player) {
						if(val.player.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"])) val.player.playSound("dig.snow");
					};						
					if (!entity.nameTag) {
						entity.nameTag = "-1";
					};
					let life_count = parseInt(entity.nameTag)
					life_count++;
					if (life_count <= simulation_vert) {
						entity.nameTag = String(life_count);
					} else {
						if(project_global_settings["LT_PARTICLES_SETTING"] === true) entity.runCommandAsync("/particle twf_calm:rainbow_flame ~ ~ ~");
						if(Math.random() > 0.99) {
							entity.runCommandAsync("/summon twf_calm:glider ~ ~1 ~");
							mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:glider', 1);
						};
						mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:controller', 1);
						entity.kill();
					};
					py += life_count;
					
					let x = undefined;
					let y = undefined;
					let z = undefined;
					let dx = undefined;
					let dz = undefined;
					let block = undefined;
					let idx = undefined;
					let matches = undefined;
					let state = undefined;
					let pos = undefined;

					current_frame = iteration%2;
					next_frame = (iteration+1)%2;
					
					for (z = -simulation_radius; z <= simulation_radius; z++) {
						dz = z+simulation_radius;
						for (x = -simulation_radius; x <= simulation_radius; x++) {
							block = dimension.getBlock( {x: px + x, y:py-1, z:pz + z});
							dx = x+simulation_radius;
							
							idx = dx+dz*array_size;

							if (block) {
								matches = block.permutation.matches("twf_calm:cell");

								if (matches) {
									field_frames[current_frame][idx] = alive_state;
									cell_count ++;
								} else {
									field_frames[current_frame][idx] = dead_state;
								};
							} else {
								field_frames[current_frame][idx] = unknown_state;  // air or nothing
							};

						};
					};


					y = 0;
					let next_field = calc_next_step(field_frames, current_frame, array_size); //
					for (z = -simulation_radius; z <= simulation_radius; z++) {
						dz = z+simulation_radius;  // Normalise
						for (x = -simulation_radius; x <= simulation_radius; x++) {
							dx = x+simulation_radius;  // Normalise
							idx = dx+dz*array_size;
							try {
								state = next_field[idx];
								if (state == alive_state) {
									pos = {x: px+x, y:py+y, z:pz+z};
									
									add_to_block_backlog( pos, dimension, block_type, false );

								}
							} catch(error) {
								// pass
							};
						};
					};
					mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:simulation', 1);
				};
				
			} catch(error) {
				mc.world.sendMessage(String(error)+" "+String(error.stack))// player can move away, chunks can unload
			}
		}
	};
	
	if (entity_controller_type === "twf_calm:life_controller" && number_of_entities_processed === 0) {
		if(block_backlog.size < project_global_settings["LT_BLOCK_BACKLOG_LIMIT"]) {		
			try {
				let entity_map = new Map();
				for (let player of players) {
					for (let entity of player.dimension.getEntities( { type: entity_controller_type } )) {
						entity_map.set(entity.id, 
						{dimension: player.dimension, entity: entity, player: player} 
						);
					};
				};		
				let items = Array.from(entity_map);
				if(items.length > 0) {		
					const e = items[Math.floor(Math.random() * items.length)]
					const key = e[0];
					const val = e[1];	
					number_of_entities_processed++;
					const entity = val.entity;
					const dimension = val.dimension;  //  I need to know which dimension we're in so I can work with the blocks correctly
					const px = entity.location.x;
					const py = entity.location.y;
					const pz = entity.location.z;
					if(val.player) {
						if(val.player.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_SOUNDS_SETTING"])) val.player.playSound("dig.snow");
					};						
					if (!entity.nameTag) {
						entity.nameTag = "-1";
					};
					let life_count = parseInt(entity.nameTag)
					life_count++;
					if (life_count <= simulation_vert) {
						entity.nameTag = String(life_count);
					} else {
						if(project_global_settings["LT_PARTICLES_SETTING"] === true) entity.runCommandAsync("/particle twf_calm:rainbow_flame ~ ~ ~");
						if(Math.random() > 0.99) {
							entity.runCommandAsync("/summon twf_calm:glider ~ ~1 ~");
							mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:glider', 1);
						};
						mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:controller', 1);
						entity.kill();
					};

					let x = undefined;
					let z = undefined;
					let dx = undefined;
					let dz = undefined;
					let block = undefined;
					let idx = undefined;
					let matches = undefined;
					let state = undefined;
					let pos = undefined;
					
					const field_layer = field_frames[iteration%2]
					for (z = -simulation_radius; z <= simulation_radius; z++) {
						dz = z+simulation_radius;
						for (x = -simulation_radius; x <= simulation_radius; x++) {
							block = dimension.getBlock( {x: px + x, y:py-1, z:pz + z});  // Scan the layer below
							dx = x+simulation_radius;
							
							idx = dx+dz*array_size;
							
							if (block) {
								matches = block.permutation.matches("twf_calm:cell");
								
								if (matches) {
									field_layer[idx] = alive_state;
								} else {
									field_layer[idx] = dead_state;
								};
							} else {
								field_layer[idx] = unknown_state;
							};
							
						};
					};

					const y = -1;
					const next_field = calc_next_step(field_frames, iteration, array_size);
					for (z = -simulation_radius; z <= simulation_radius; z++) {
						dz = z+simulation_radius;  // Normalise
						for (x = -simulation_radius; x <= simulation_radius; x++) {
							dx = x+simulation_radius;  // Normalise
							idx = dx+dz*array_size;
							try {
								state = next_field[idx];
								pos = {x: px+x, y:py+y, z:pz+z};
								if (state == alive_state) {
									block = dimension.getBlock( {x: px + x, y:py+y, z:pz + z});
									if (block.permutation.matches("twf_calm:cell") || block.permutation.matches("minecraft:air")) {
										dimension.getBlock( pos ).setPermutation(cells[1]);
										cell_count ++;
									}
								} else {
									block = dimension.getBlock( {x: px + x, y:py+y, z:pz + z});
									if (block.permutation.matches("twf_calm:cell")) {
										dimension.getBlock( pos ).setPermutation(cells[0]);
									}
								}
							} catch(error) {
								// pass
							};
						};
					};
					mc.world.scoreboard.getObjective('twf_calm:jig_computer.addon_stats')?.addScore('twf_calm:simulation', 1);
				};
				
			} catch(error) {
				mc.world.sendMessage(String(error)+" "+String(error.stack))// player can move away, chunks can unload
			}
		}
	};
	
	if(performance_debug) {
		const end_time = new Date().getTime();		
		send_alert("[TWF] game_update() runtime is ", String(end_time - start_time));
	};
};

function process_entity_backlog(time_limit) {
	const start_time = new Date().getTime();
	
	let remove_keys = [];
	
	for (let [key, val] of entity_backlog.entries()) {
		try {
			if(val) {
				val.d.runCommandAsync('/summon '+val.e+' '+val.p.x.toString()+' '+val.p.y.toString()+' '+val.p.z.toString());				
				remove_keys.push(key);
			};

		} catch(error) {
			if(entity_placement_debug) {
				send_alert(key, entity_backlog.get( key ));
				send_alert("process_block_backlog() error", error);
			};			
			if(remove_backlog_on_error == true) {
				remove_keys.push(key);
			};
		};
		
		if(new Date().getTime() - start_time >= time_limit) {
			break
		}
	}
	
	remove_keys.forEach((key) => {
		entity_backlog.delete(key)
	});
};

function process_block_backlog(time_limit) {
	const start_time = new Date().getTime();
	
	let remove_keys = [];
	for (let [key, val] of block_backlog.entries()) {
		try {
			let dimension = val.d
			if(val) {
				let block = dimension.getBlock( val.p )
				let overwrite = val.o
				if(block){
					if(val.o) {
						block.setPermutation( val.b );
					} else {
						if(block.permutation.matches("minecraft:air")) {
							block.setPermutation( val.b );
						};
					};
					remove_keys.push(key);
				};
			};

		} catch(error) {
			if(block_placement_debug) {
				send_alert(key, block_backlog.get( key ));
				send_alert("process_block_backlog() error", error);
			};			
			if(remove_backlog_on_error == true) {
				remove_keys.push(key);
			};
		};
		
		if(new Date().getTime() - start_time >= time_limit) {
			break
		}
	}
	remove_keys.forEach((key) => {
		block_backlog.delete(key)
	});
};

function run_each_frame() {
	const start_time = new Date().getTime();

	if(!initialised) {	// Run once code
		game_initialise()
		initialised = true
		try {
			mc.world.scoreboard.addObjective('twf_calm:jig_computer.addon_stats','dummy')
		} catch(error)
		{
			// pass - non-critical, and likely if the world has already been initialised
		}
	};

	iteration += 1;
	
	if(iteration % 37 == 0) {	
		for(let dimension of dimensions) {
			for (let entity of dimension.getEntities( { type: 'twf_calm:poster' } )) {
				
				if(Math.random() > 0.9) {
					entity.runCommandAsync("/tp @s ~ ~ ~ facing @p");
					if(Math.random() > 0.9) {
						if(project_global_settings["LT_PARTICLES_SETTING"] === true) entity.runCommandAsync("/particle twf_calm:ring ~ ~0.5 ~");
					}
				}
			}
		}		
	}
	
	if(iteration % 40 == 0) {
		for(let i = 0; i < dimensions.length; i++) {
			let dimension = dimensions[i]
			dimension.runCommandAsync("/execute as @e[type=twf_calm:glider] at @s run tp @s ^ ^ ^0.025");
		};
	} else if(iteration % 20 == 0) {
		for(let i = 0; i < dimensions.length; i++) {
			let dimension = dimensions[i]
			dimension.runCommandAsync("/execute as @e[type=twf_calm:glider] at @s run tp @s ^0.025 ^ ^");
		};
	}
	
	const update_every = project_global_settings["LT_RUN_EVERY"];
	
	if(iteration % (update_every+global_watchdog_backoff) == 0) {
		game_update(cells[1], "twf_calm:life_controller", project_global_settings["LT_SIMULATION_RADIUS"]);
		if(global_watchdog_runlong_count == 0) { global_watchdog_backoff = 0 };
	};

	if(iteration % (update_every+3+global_watchdog_backoff) == 0) {
		game_update(cells[1], "twf_calm:life_builder", project_global_settings["LT_SIMULATION_RADIUS"])
	};


	if(iteration % (update_every+2) == 0) {
		game_update(cells[0], "twf_calm:life_destroyer", project_global_settings["LT_SIMULATION_RADIUS"]*2)
	};

	if(iteration % (update_every+4) == 0) {
		game_update(cells[2], "twf_calm:life_randomiser", 1)
	};

	if(iteration % ((update_every+4)*2+1) == 0) {
		game_update(cells[2], "twf_calm:life_converter", 1)
	};

	let time_budget_limit = project_global_settings["LT_TIME_BUDGET_LIMIT"];
	//mc.world.sendMessage(String(time_budget_limit));
	let available_time = time_budget_limit - (new Date().getTime() - start_time)
	if(available_time >= time_budget_minimum && available_time <= time_budget_limit) {
		send_alert("entity_backlog length is ", String(entity_backlog.size));
		process_entity_backlog( available_time )
	};
	
	const start_time2 = new Date().getTime();
	available_time = time_budget_limit - (new Date().getTime() - start_time2)
	if(available_time >= time_budget_minimum && available_time <= time_budget_limit) {
		process_block_backlog( available_time )
	};

	if(performance_debug) {
		const end_time = new Date().getTime();		
		send_alert("[TWF] run_each_frame() runtime is ", String(end_time - start_time));
		send_alert("[TWF] run_each_frame() block_backlog length is ", String(block_backlog.size));
		send_alert("[TWF] run_each_frame() entity_backlog length is ", String(entity_backlog.size));
	};
	
	let deltatime = new Date().getTime() - start_time
	if(deltatime > project_global_settings["LT_TIME_BUDGET_LIMIT"]) {
		if(debug) mc.world.sendMessage("-: "+String(deltatime)+" ("+String(iteration)+")");
		global_watchdog_runlong_count += 1;
		if(global_watchdog_runlong_count > 0) {
			global_watchdog_backoff = update_every*(project_global_settings["LT_WATCHDOG_BACKOFF"]+Math.floor(Math.random() * project_global_settings["LT_WATCHDOG_BACKOFF"]));  //  If we ran long, cool it for a bit.
			global_watchdog_runlong_count = 0;
		};
	}
};

mc.system.runInterval(() => {
	try {
		run_each_frame();
	} catch(error) {
		if(debug) mc.world.sendMessage("[TWF] Error in mc.system.runInterval: "+String(error)+" "+String(error.stack));
	};
}, 1);

const GENE_SPHERE_ITEM_NAME = "Soul Ball"

mc.world.afterEvents.entityHurt.subscribe((event) => {
	const { damageSource, hurtEntity } = event;
	if (damageSource) {
		if (!(damageSource.damagingEntity instanceof mc.Player)) return;
		if (damageSource.cause !== "entityAttack") return;
		if (damageSource.damagingEntity.getDynamicProperty(project_global_settings["PLAYER_SETTING_KEYS"]["LT_CAGE_SETTING"]) !== true) return;
		let inv = damageSource.damagingEntity.getComponent( 'inventory' ).container;

		if(inv) {
			let goggles = false;
			let comp = damageSource.damagingEntity.getComponent("equippable");
			if(comp) {
				let dev = comp.getEquipment("Mainhand");
				if(dev) {
					if(!dev.typeId.includes('twf_calm:sword_of_')) {
						return; // Has to be a sword of life
					}
				}
				dev = comp.getEquipment("Head");
				if(dev) {
					
					if(!dev.typeId.includes('twf_calm:goggles')) {
						return; // Has to be wearing the critter goggles
					}
				} else {
					return;
				};
			}
		}
		
		// mc.world.sendMessage('Stealing Life Force!');
		const item = new mc.ItemStack("minecraft:snowball", 1);
		let lore = [
			'§c§lType§r',
			String(hurtEntity.typeId)
		]

		if(hurtEntity.nameTag !== undefined && hurtEntity.nameTag !== "") {
			lore.push('§c§lName§r');
			lore.push(String(hurtEntity.nameTag));
		};
		item.setLore(lore);
		item.nameTag = GENE_SPHERE_ITEM_NAME
		damageSource.damagingEntity.dimension.spawnItem(item, hurtEntity.location);
		if(project_global_settings["LT_PARTICLES_SETTING"] === true) hurtEntity.runCommandAsync("/particle twf_calm:rainbow_flame "+String(hurtEntity.location.x)+" "+String(hurtEntity.location.y)+" "+String(hurtEntity.location.z));
		hurtEntity.teleport({x:hurtEntity.location.x, y:-10000, z:hurtEntity.location.z} );
		event.cancel;
	}
});



mc.world.beforeEvents.itemUseOn.subscribe((event) => {
	const { source, block, itemStack } = event
	
	if (!(source instanceof mc.Player)) return;
	if (!(itemStack.nameTag === GENE_SPHERE_ITEM_NAME)) return;
	// mc.world.sendMessage('Releasing Life Force!');	
	const mob_type = itemStack.getLore()[1]
	
    mc.system.runTimeout(() => {
		try {
			const mob = source.dimension.spawnEntity(mob_type, { x: block.location.x+0.5, y: block.location.y+1, z: block.location.z+0.5 });
			if(itemStack.getLore().length > 2) {
				if(itemStack.getLore()[3] !== undefined && itemStack.getLore()[3] !== "") {
					mob.nameTag = itemStack.getLore()[3]
				}
			} else {

			}
			if(project_global_settings["LT_PARTICLES_SETTING"] === true) mob.runCommandAsync("/particle twf_calm:rainbow_flame "+String(mob.location.x)+" "+String(mob.location.y)+" "+String(mob.location.z));
			
		} catch(error) {
			// mc.world.sendMessage(error+" "+String(error.stack));
		}
    }, 1);
});