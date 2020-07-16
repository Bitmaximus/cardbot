const {Card}  = require('./card.js');
const _ = require('lodash');

class Deck {
    constructor() {
        let my_cards = [];
        for(let i=0; i<52; i++){
            let card = new Card(i);
            my_cards.push(card); 
        }
        this._cards = my_cards;
        this._ini_cards = my_cards;
    }

    get cards() {
        return this._cards;
    }

    set cards(value) {
        this._cards = value;
    }

    reset() {
        this._cards = this._ini_cards;
    }

    pick(n,loc) {
        if (n<0 || n>51) return;
        var drawn_cards = [];
        for (let i=0; i<n; i++){
            let id_to_pick = getRandomIntInclusive(0,this._cards.length-1)
            let picked_card = this._cards.splice(id_to_pick,1)[0];
            picked_card.location = loc;
            if (["Flop", "Turn", "River"].includes(loc)) picked_card.visible = true;
            drawn_cards.push(picked_card);
        }
        return drawn_cards;
    }

    cheat(idx) {
        if (idx<0 || idx>51) return;
        var drawn_cards = [];
        let picked_card =  _.remove(this._cards, (n) => n.id == idx)[0];
        drawn_cards.push(picked_card);
        return drawn_cards;
    }
    
    toString() {
        return (this._cards).map(x => x.toString());
    }

  }

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

exports.Deck = Deck;