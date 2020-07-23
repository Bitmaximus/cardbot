const {Pot} = require('./pot.js');
const {Hand} = require('./hand.js');
const {createCanvas, loadImage} = require('canvas');
const Discord = require('discord.js');
const {functionName} = require('../functionName.js');

class Round {   
    constructor(number, dealer_idx){
        this._number = number;
        this._dealer_idx = dealer_idx

        this._state = states[0]; //See 'states' array
        this._board = []; //0|3|4|5 cards on board
        this._hands = []; //Only keep hands of players that remain in the round.
        this._hand_history = [];
        this._pot = new Pot();
    } 

    async deal_hands(){
        for(let player of game.players){
            let cards = game.deck.pick(2,"Hand");
            player.send_hand(cards, this._number);
            this._hands.push(new Hand(cards, player.seat_idx));
        }
        await game.channel.send(`__**Hand#${this._number}\n**__Hands have been dealt to all players. Good luck!`).then(msg => game.message = msg);
        let dealer = game.players[this._dealer_idx-1];
        game.channel.send(`Dealer is ${dealer.nick_or_name()}`);
    }

    async deal_flop(){
        // select new cards and draw them to the table.
        game.deck.pick(1,"Muck");
		//for(let card of game.deck.pick(3,"Flop")) this._board.push(card);
        await game.table.add_cards(this._board)
                        .catch((err) => game.end(err));

        // announce the flop and print the new table.
        // await game.message.delete()
        //                   .catch(console.error);  // non-fatal error.
		// await game.channel.send(`**__Here comes the flop!__**`, await display_horizontal(this._board)
		// 																.catch(console.error))
        //                   .then(msg => game.message = msg)
        //                   .catch((err) => {
        //                     	console.log("round.deal_flop(): Failed to announce the flop.");
        //                    		console.error(err);
		//                    }); // non-fatal error.
        await game.table.print_table(game.channel, `**__Here comes the flop!__**`)
                        .catch((err) => {
                        	console.log(`${console.log(functionName())}: Failed to print table.`);
                            game.end(err);
                        }); // fatal error
    }

    async deal_turn(){
        game.deck.pick(1,"Muck");
		this._board.push(game.deck.pick(1,"Turn")[0]);
		await game.table.add_cards(this._board)
                        .catch((err) => game.end(err));
        // await game.message.delete();
		// await game.channel.send(`**__Burn and TURN baby!!!__**`, await display_horizontal(this._board)).then(msg => game.message = msg);
		await game.table.print_table(game.channel, `**__Burn and TURN baby!!!__**`)
                        .catch((err) => {
                        	console.log(`${console.log(functionName())}: Failed to print table.`);
                            game.end(err);
                        }); // fatal error
    }

    async deal_river(){
        game.deck.pick(1,"Muck");
        this._board.push(game.deck.pick(1,"River")[0]);
		await game.table.add_cards(this._board)
						.catch((err) => game.end(err));
		// await game.message.delete();
		// await game.channel.send(`**__This is it, the river!__**`, await display_horizontal(this._board)).then(msg => game.message = msg);
		await game.table.print_table(game.channel, `**__This is it, the river!__**`)
                        .catch((err) => {
                        	console.log(`${console.log(functionName())}: Failed to print table.`);
                            game.end(err);
                        }); // fatal error
    }

    async start_showdown(){
        let hand_results = [];
        for (let i = 0; i<this._hands.length; i++) hand_results.push(this._hands[i].evaluate(this._board));
        for (let i = 0; i<this._hands.length; i++){
            let player = game.players[this._hands[i].owner-1];    
            game.channel.send(`${player.nick_or_name()} holding ${this._hands[i].toString()} has: ${hand_results[i]}\n`)
        }
        game.channel.send(hand_results.sort(poker_sort));
    }

    async advance_betting_round(id_to_act){
        game.players[id_to_act].prompt_move().then((move) => {this.onPlayerMove(id_to_act, move)});
    }
    // game.channel.send(`Action is on ${(first_actor.member.nickname)?first_actor.member.nickname:first_actor.member.user.username}`)
    // while (all player responses != check || fold && bets_not_equal && player_action_completed.size == players.size)

    onPlayerMove(actor_id, move){
        game.channel.send(`**${move}**`);
        this._hand_history.push(move);
        if (this.should_end_betting_round()) {this.advance_state();
            this.hand_history = [];}
        else this.advance_betting_round(actor_id-1 % game.players.length);
    }

    should_end_betting_round(){
        return (this._hand_history.length >= game.players.length);
    }

    async advance_state(){
        if (states.indexOf(this._state) < 5) {
            switch(this._state){
                case "PRE-FLOP":
                    await this.deal_hands();
                    this.advance_betting_round((game.players.length > 2)? this._dealer_idx-3 % game.players.length : this._dealer_idx-1);
                    break;
                case "FLOP": 
                    this._pot.collect_bets();
                    await this.deal_flop();
                    this.advance_betting_round((game.players.length > 2)? this._dealer_idx-1 % game.players.length : this._dealer_idx-1);
                    break;
                case "TURN":
                    this._pot.collect_bets();
                    await this.deal_turn();
                    this.advance_betting_round((game.players.length > 2)? this._dealer_idx-1 % game.players.length : this._dealer_idx-1);
                    break;
                case "RIVER":
                    this._pot.collect_bets();
                    await this.deal_river();
                    this.advance_betting_round((game.players.length > 2)? this._dealer_idx-1 % game.players.length : this._dealer_idx-1);
                    break;
                case "SHOW-DOWN": 
                    this._pot.collect_bets();
                    await this.start_showdown();
                    game.start_new_round();
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

let display_horizontal = async (cards) => {
	const canvas = createCanvas(cards.length * 135, 181);
	const ctx = canvas.getContext('2d');
	for (let i=0; i< cards.length; i++) {
		const card_image = await loadImage(`./card_images_75/${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png`);
		ctx.drawImage(card_image, 135*i, 0);
    }
    
    return new Discord.MessageAttachment(canvas.toBuffer(), 'cards.png');
}

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

exports.Round = Round;