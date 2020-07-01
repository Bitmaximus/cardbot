const utils = require('./utils.js');

class Card {
 
    constructor(id) {
        if (id < 52){
        this._location = "Deck";
        this._valid = true;
        this._visible = false;
        this._id = id;
        this._suit = utils.suit_name_list[Math.floor(id/13)];
        this._rank = utils.card_name_list[id % 13];
        }
        else this._valid = false
    }

    get suit() {
        return this._suit;
    }

    set suit(value){
        this._suit = value;
    }

    get rank() {
        return this._rank;
    }

    set rank(value){
        this._rank = value;
    }

    get location(){
        return this._location;
    }

    set location(value){
        this._location = value;
    }

    toString() {
        return this._rank.fullname + " of " + this._suit.fullname;
    }
}

exports.Card = Card;