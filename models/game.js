const {Deck} = require('./deck.js');
const {Round} = require('./round.js');
const {Player} = require('./player.js');
const {Table} = require('./table.js');

class Game{
    
    constructor(members, structure, channel){
        //Constants
        this._players = members.map((member,idx) => new Player(member, idx+1, structure.starting_stack));
        this._structure = structure;
        this._message = null;
        this._channel = channel;
        //Deck
        this._deck = new Deck();
        //Table
        this._table = new Table(this._players);
        //Round
        this._round = new Round(1,getRandomIntInclusive(0,this._players.length));
    }

    start_new_round(){
        this._deck.reset();
        this._table.reset();
        this._round = new Round(this._round.number+1,this._round.dealer_idx-1 % this._players.length);
        this._round.advance_state();
    }

	// end the game
    end(reason){
		console.log(reason);
		
		// clean up messages

		//end the game
		process.exit(1);
		
    }

    get players(){return this._players}
    set players(players){this._players = players}

    get structure(){return this._structure}
    set structure(value){this._structure = value}

    get round(){return this._round}
    set round(value){this._round = value}

    get table(){return this._table}
    set table(value){this._table = value}

    get deck(){return this._deck}
    set deck(value){this._deck = value}

    get message(){return this._message}
    set message(value){this._message = value}

    get channel(){return this._channel}
    set channel(value){this._channel = value}
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

exports.Game = Game;