class GameStructure{
    constructor(small_blind_levels, blind_timer, starting_stack){
        this._small_blind_levels = small_blind_levels;
        this._large_blind_levels = small_blind_levels.map(amt => amt*2);
        this._blind_timer = blind_timer;
        this._starting_stack = starting_stack;
    }

    get small_blind_levels() {
        return this._small_blind_levels;
    }

    set small_blind_levels(value){
        this._small_blind_levels = value;
    }

    get large_blind_levels() {
        return this._large_blind_levels;
    }

    set large_blind_levels(value){
        this.large_blind_levels = value;
    }

    get starting_stack() {
        return this._starting_stack;
    }

    set starting_stack(value){
        this._starting_stack = value;
    }

    get blind_timer() {
        return this._blind_timer;
    }

    set blind_timer(value){
        this._blind_timer = value;
    }
}

const default_blinds = [
    5,
    10,		
    15,		
    20,		
    30,		
    50,		
    75,		
    125,		
    200,	
    300,	
    500,	
    800,	
    1500
]
    
const default_blind_timer = 20;

const default_starting_stack = 1000;

exports.GameStructure = GameStructure;
exports.default_blinds = default_blinds;
exports.default_blind_timer = default_blind_timer;
exports.default_starting_stack = default_starting_stack;