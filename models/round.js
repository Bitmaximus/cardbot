const {Pot} = require('./pot.js');
const {Hand} = require('./hand.js');
const {createCanvas, loadImage} = require('canvas');
const Discord = require('discord.js');

class Round {   
    constructor(number, dealer_idx){
        this._number = number;
        this._dealer_idx = dealer_idx

        this._state = states[0]; //See 'states' array
        this._board = []; //0|3|4|5 cards on board
        this._hands = []; //Only keep hands of players that remain in the round.
        this._pot = new Pot(); 
    } 

    deal_hands(){
        for(let player of game.players){
            let cards = game.deck.pick(2,"Hand");
            player.send_hand(cards, this._number);
            this._hands.push(new Hand(cards, player.seat_idx));
        }
        game.channel.send("Hands have been dealt to all players. Good luck!").then(msg => game.message = msg);
        let dealer = game.players[this._dealer_idx-1].member;
        game.channel.send(`Dealer is ${(dealer.nickname)?dealer.nickname:dealer.user.username}`);
    }

    async deal_flop(){
        game.deck.pick(1,"Muck");
        for(let card of game.deck.pick(3,"Flop")) this._board.push(card);
        await game.message.delete();
        game.channel.send(`**__Here comes the flop!__**`, await display_horizontal(this._board)).then(msg => game.message = msg);
    }

    async deal_turn(){
        game.deck.pick(1,"Muck");
        this._board.push(game.deck.pick(1,"Turn")[0]);
        await game.message.delete();
        game.channel.send(`**__Burn and TURN baby!!!__**`, await display_horizontal(this._board)).then(msg => game.message = msg);
    }

    async deal_river(){
        game.deck.pick(1,"Muck");
        this._board.push(game.deck.pick(1,"River")[0]);
        await game.message.delete();
        game.channel.send(`**__This is it, the river!__**`, await display_horizontal(this._board)).then(msg => game.message = msg);
    }

    async start_showdown(){
        let hand_results = [];
        for (let i = 0; i<this._hands.length; i++) hand_results.push(this._hands[i].evaluate(this._board));
        for (let i = 0; i<this._hands.length; i++){
            let player = game.players[this._hands[i].owner-1];    
            game.channel.send(`${(player.member.nickname)? player.member.nickname : player.member.user.username} holding ${this._hands[i].toString()} has: ${hand_results[i]}\n`)
        }
        game.channel.send(hand_results.sort(poker_sort));
    }

    async init_betting_round(id_to_act){
        this.next_player(id_to_act);
        // game.channel.send(`Action is on ${(first_actor.member.nickname)?first_actor.member.nickname:first_actor.member.user.username}`)
    }

    next_player(id){
        let first_actor = game.players[id-1];
        first_actor.prompt_move().then((response) => console.log(response));
    }

    onPlayerMove(player_id, move){

    }

    advance_state(){    
        if (states.indexOf(this._state) < 5) {
            
            switch(states.indexOf(this._state)){
                case 0: 
                    this.deal_hands();
                    this.init_betting_round((game.players.legnth > 2)? this._dealer_idx-3 % game.players.length : this._dealer_idx);
                    break;
                case 1: 
                    this._pot.collect_bets();
                    this.deal_flop();
                    this.init_betting_round(this._dealer_idx-1 % game._players.length);
                    break;
                case 2:
                    this._pot.collect_bets();
                    this.deal_turn();
                    this.init_betting_round(this._dealer_idx-1 % game._players.length);
                    break;
                case 3:
                    this._pot.collect_bets();
                    this.deal_river();
                    this.init_betting_round(this._dealer_idx-1 % game._players.length);
                    break;
                case 4: 
                    this._pot.collect_bets();
                    this.start_showdown();
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

    get pot(){return this._pot}
    set pot(value){this._pot = value}
}

const states = [
    "INITIALIZED",
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