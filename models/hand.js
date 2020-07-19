const _ = require('lodash');
const {HandResult} = require('./hand_result.js');

class Hand{
    constructor(cards, seat_number){
        this._cards = cards;
        this._owner = seat_number;
	}
	
	evaluate(board){
        let cards = [];
        for(let card of board) cards.push(card);
        for(let card of this._cards) cards.push(card);
        let result = eval_best_hand(cards);
        return result;
    }

    toString(){return `(${this._cards.map(card => card.toString()).join(", ")})`}

    get cards(){return this._cards}
    set cards(value){this._cards = value}

    get owner(){return this._owner}
    set owner(value){ this._owner = value}
}

const suit_name_list = {
	"0" : {name : "C", fullname : "Clubs", emoji : "\\♣️"},
	"1" : {name : "D", fullname : "Diamonds", emoji : "\\♦️"},
	"2" : {name : "H", fullname : "Hearts", emoji : "\\♥️"},
	"3" : {name : "S", fullname : "Spades", emoji : "\\♠️"}
}

function check_straights(cards){
	if (!cards || cards.length < 5) return;
	let ranks_by_suit = [cards.filter(x => x.suit.name === 'C').map(x => x.id).sort((a,b)=>b-a), 
		cards.filter(x => x.suit.name === 'D').map(x => x.id).sort((a,b)=>b-a),
		cards.filter(x => x.suit.name === 'H').map(x => x.id).sort((a,b)=>b-a), 
		cards.filter(x => x.suit.name === 'S').map(x => x.id).sort((a,b)=>b-a),
		_.uniq(cards.map(x => x.rank.val).sort((a,b)=>b-a))
	]

	for (let i=0; i < ranks_by_suit.length; i++){
		if (ranks_by_suit[i].includes('14')) ranks_by_suit[i].push('1');
		let partial = [ranks_by_suit[i][0]];
		for(let j=1; j<ranks_by_suit[i].length; j++){
			if (ranks_by_suit[i][j] == partial[partial.length-1]-1) partial.push(ranks_by_suit[i][j]);
			else partial = [ranks_by_suit[i][j]];
			if (partial.length == 5 && i<4) return new HandResult(8,[partial[0], suit_name_list[i].fullname],[]);
			if (partial.length == 5 && i==4) return new HandResult(4,[partial[0]],[]);
		}
	}
	return false;                                                                                                                                                                                                                              
}

function check_flush(cards){
	if (!cards || cards.length < 5) return; 
	let freq = {};
	for (let i = 0; i < cards.length; i++) {freq[(cards[i].suit.fullname)] = freq[(cards[i].suit.fullname)] + 1 || 1;}
	let freq_arr = Object.entries(freq);
	let max_flush = _.maxBy(freq_arr, function(p) { return p[1]; });
	return (max_flush[1]>4)? new HandResult(5, max_flush[0], cards.filter(x => x.suit.fullname == max_flush[0]).map(x => x.rank.val).sort((a,b)=>b-a).slice(0,5)):false;
}

function eval_dupes(cards){
	if (!cards || cards.length < 5) return; 

	let freq = {}; for (let i = 0; i < cards.length; i++) {freq[(cards[i].rank.val)] = freq[(cards[i].rank.val)] + 1 || 1};
	let dupes = Object.entries(freq).sort((a,b) => b[0]-a[0]);

	let max_duped = _.maxBy(dupes, function(p) { return p[1]; });
	dupes.splice(dupes.indexOf(max_duped),1);

	let next_max_duped = _.maxBy(dupes, function(p) { return p[1]; });
	dupes.splice(dupes.indexOf(next_max_duped),1);

	switch(max_duped[1]) {
		case 4: 
		return new HandResult(7,[max_duped[0]],[Math.max(...dupes.map(x => x[0]))]);
		case 3: return (next_max_duped[1]>1)? 
			   new HandResult(6,[max_duped[0],next_max_duped[0]],[]) : 
			   new HandResult(3, max_duped[0], [next_max_duped[0], Math.max(...dupes.map(x => x[0]))]);
		case 2: return (next_max_duped[1] == 2)? 
			   new HandResult(2, [max_duped[0], next_max_duped[0]], [dupes.map(x => x[0])[0]]) : 
			   new HandResult(1, [max_duped[0]],[next_max_duped[0]].concat(dupes.map(x=>x[0]).slice(0,2)));
		default: 
		return new HandResult(0,[max_duped[0]], [next_max_duped[0]].concat(dupes.map(x=>x[0]).slice(0,3)));
	}
}

function eval_best_hand(cards){
	if (!cards || cards.length < 5) return; 
	let results = [];
	let dupes_eval = eval_dupes(cards); if (dupes_eval) results.push(dupes_eval);
	let f_eval = check_flush(cards); if (f_eval) results.push(f_eval);
	let s_eval = check_straights(cards); if (s_eval) results.push(s_eval);
	return _.maxBy(results, function(p) {return p.type});
}

exports.Hand = Hand;