const {Card}  = require('./card.js');
const utils = require('./utils.js');

class Deck {
    constructor() {
        let my_cards = [];
        for(let i=0; i<52; i++){
            let card = new Card(i);
            my_cards.push(card); 
        }
        this._cards = my_cards;
    }
  
    get cards() {
        return this._cards;
    }

    set cards(value) {
        this._cards = value;
    }

    pick(n,loc) {
        if (n<1 || n>52) return;
        var drawn_cards = [];
        for (let i=0; i<n; i++){
            let id_to_pick = utils.getRandomIntInclusive(0,this._cards.length-1)
            let picked_card = this._cards.splice(id_to_pick,1)[0];
            picked_card.location = loc;
            drawn_cards.push(picked_card);
        }
        return drawn_cards;
    }
    
    toString() {
        return (this._cards).map(x => x.toString());
    }

  }

  exports.Deck = Deck;