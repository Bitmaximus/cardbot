const {Pot} = require('./pot.js');
const {Hand} = require('./hand.js');
const {Player_In_Round} = require('./player_in_round.js');
const Discord = require('discord.js');
const {functionName} = require('../functionName.js');

class Round {   
    constructor(number, dealer_idx, game){
        this._number = number;
        this._dealer_idx = dealer_idx
        this._game = game;
        this._state = states[0]; //See 'states' array
        this._board = []; //0|3|4|5 cards on board
        this._hands = []; //Only keep players that remain in the round.
        this._hand_history = [];
        this._pot = new Pot();
    }

    async deal_hands(){
        for(let player of this._game.players){
            let cards = this._game.deck.pick(2,"Hand");
            player.send_hand(cards, this._number);
            this._hands.push(new Hand(cards, player.seat_idx));
        }
        await this._game.channel.send(`__**Hand#${this._number}\n**__Hands have been dealt to all players. Good luck!`).then(msg => this._game.message = msg);
        let dealer = this._game.players[this._dealer_idx];
        this._game.channel.send(`Dealer is ${dealer.nick_or_name()}`);
    }

    async deal_flop(){
        // select new cards and draw them to the table.
        this._game.deck.pick(1,"Muck");
        for(let card of this._game.deck.pick(3,"Flop")) this._board.push(card);
        await this._game.table.add_cards(this._board)
                        .catch((err) => this._game.end(err));
    }

    async deal_turn(){
        game.deck.pick(1,"Muck");
		this._board.push(this._game.deck.pick(1,"Turn")[0]);
		await this._game.table.add_cards(this._board)
                        .catch((err) => game.end(err));
    }

    async deal_river(){
        this._game.deck.pick(1,"Muck");
        this._board.push(this._game.deck.pick(1,"River")[0]);
		await this._game.table.add_cards(this._board)
						.catch((err) => this._game.end(err));
    }

    async start_showdown(){
        let hand_results = [];
        for (let i = 0; i<this._hands.length; i++) hand_results.push(this._hands[i].evaluate(this._board));
        for (let i = 0; i<this._hands.length; i++){
            let player = this._game.players[this._hands[i].owner-1];    
            this._game.channel.send(`${player.nick_or_name()} holding ${this._hands[i].toString()} has: ${hand_results[i]}\n`)
        }
        this._game.channel.send(hand_results.sort(poker_sort));
    }

    async start_betting_round(id_to_act, messageToPrint){
        //Main loop for betting round
        while (!this.should_end_betting_round()) {
			await this._game.table.update_player(this._game.players[id_to_act], "Active");
			await this._game.table.print_table(this._game.channel, messageToPrint)
								  .catch((err) => {
				  					console.log(`${console.log(functionName())}: Failed to print table.`);
				  					this._game.end(err);
								  }); // fatal error;
			let move = await this._game.players[id_to_act].prompt_move().catch(console.error);
			if (move.action_type != "Bet" && move.action_type != "Raise") {
				await this._game.table.update_player(this._game.players[id_to_act], move.action_type);
				//await this._game.table.print_table(this._game.channel);
			} else {
				// this is not yet implemented.
			}
            this._game.channel.send(`**${move}**`).catch(console.error);
            this._hand_history.push(move);
            id_to_act = mod(++id_to_act, this._game.players.length);
        }
        //Betting round over
        this.advance_state();
        this.hand_history = [];
    }

    should_end_betting_round(){return (this._hand_history.length >= this._game.players.length);}

    async advance_state(){
        const num_players = this._game.players.length
        if (states.indexOf(this._state) < 5) {
            switch(this._state){
                case "PRE-FLOP":
                    await this.deal_hands();
                    this.start_betting_round((num_players>2)? mod(this._dealer_idx+3, num_players) : this._dealer_idx);
                    break;
                case "FLOP": 
                    this._pot.collect_bets();
                    await this.deal_flop();
                    this.start_betting_round(mod(this._dealer_idx+1, num_players), `**__Here comes the flop!__**`);
                    break;
                case "TURN":
                    this._pot.collect_bets();
                    await this.deal_turn();
                    this.start_betting_round(mod(this._dealer_idx+1, num_players), `**__Burn and turn baby__**`);
                    break;
                case "RIVER":
                    this._pot.collect_bets();
                    await this.deal_river();
                    this.start_betting_round(mod(this._dealer_idx+1, num_players), `**__This is it, the rive!__**`);
                    break;
                case "SHOW-DOWN": 
                    this._pot.collect_bets();
                    await this.start_showdown();
                    this._game.start_new_round();
                    break;
            }
            this._state = states[states.indexOf(this._state)+1];    
        }
    }

    get state(){return this._state}
    set state(value){this._state = value}

    get number(){return this._number}
    set number(value){this._number = value}

    get dealer_idx(){return this._dealer_idx}
    set dealer_idx(value){this._dealer_idx = value}

    get board(){return this._board}
    set board(value){this._board = value}

    get hands(){return this._hands}
    set hands(value){this._hands = value}

    get hand_history(){return this._hand_history}
    set hand_history(value){this._hand_history = value}

    get pot(){return this._pot}
    set pot(value){this._pot = value}
}

const states = [
	"PRE-FLOP",
	"FLOP",
	"TURN",
    "RIVER",
    "SHOW-DOWN"
]

let poker_sort = (a,b) => {
    if (b.type - a.type != 0) return (b.type - a.type);
    switch(a.type) {
        case 0: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0]) 
        :(b.kickers[0] - a.kickers[0] != 0)? (b.kickers[0] - a.kickers[0])
        :(b.kickers[1] - a.kickers[1] != 0)? (b.kickers[1] - a.kickers[1])
        :(b.kickers[2] - a.kickers[2] != 0)? (b.kickers[2] - a.kickers[2])
        :(b.kickers[3] - a.kickers[3] != 0)? (b.kickers[3] - a.kickers[3])
        : 0;
        
        case 1: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0])
        :(b.kickers[0] - a.kickers[0] != 0)? (b.kickers[0] - a.kickers[0])
        :(b.kickers[1] - a.kickers[1] != 0)? (b.kickers[1] - a.kickers[1])
        :(b.kickers[2] - a.kickers[2] != 0)? (b.kickers[2] - a.kickers[2])
        : 0;
        
        case 2: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0])
        :(b.quality[1] - a.quality[1] != 0)? (b.quality[1] - a.quality[1]) 
        : 0;
        
        case 3: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0]) 
        :(b.kickers[0] - a.kickers[0] != 0)? (b.kickers[0] - a.kickers[0])
        :(b.kickers[1] - a.kickers[1] != 0)? (b.kickers[1] - a.kickers[1])
        :(b.kickers[0] - a.kickers[0] != 0)? (b.kickers[0] - a.kickers[0])
        : 0;
        
        case 4: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0]) 
        : 0;
        
        case 5: return (b.kickers[0] - a.kickers[0] != 0)? (b.kickers[0] - a.kickers[0])
        :(b.kickers[1] - a.kickers[1] != 0)? (b.kickers[1] - a.kickers[1])
        :(b.kickers[2] - a.kickers[2] != 0)? (b.kickers[2] - a.kickers[2])
        :(b.kickers[3] - a.kickers[3] != 0)? (b.kickers[3] - a.kickers[3])
        :(b.kickers[4] - a.kickers[4] != 0)? (b.kickers[4] - a.kickers[4])
        : 0;

        case 6: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0])
        : (b.quality[1] - a.quality[1] != 0)? (b.quality[1] - a.quality[1]) 
        : 0 ;
        
        case 7: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0])
        : (b.kickers[0] - a.kickers[0] != 0)? (b.kickers[0] - a.kickers[0]) 
        : 0 ;
        
        case 8: return (b.quality[0] - a.quality[0] != 0)? (b.quality[0] - a.quality[0]) 
        : 0;
    }
}

function mod(n, m){return ((n % m) + m) % m}


exports.Round = Round;