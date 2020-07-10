const card_name_list = {
	"0" : {name : "2", fullname : "Two", val : "2"},
	"1" : {name : "3", fullname : "Three", val : "3"},
	"2" : {name : "4", fullname : "Four", val : "4"},
	"3" : {name : "5", fullname : "Five", val : "5"},
	"4" : {name : "6", fullname : "Six", val : "6"},
	"5" : {name : "7", fullname : "Seven", val : "7"},
	"6" : {name : "8", fullname : "Eight", val : "8"},
	"7" : {name : "9", fullname : "Nine", val : "9"},
	"8" : {name : "T", fullname : "Ten", val : "10"},
	"9" : {name : "J", fullname : "Jack", val : "11"},
	"10" : {name : "Q", fullname : "Queen", val : "12"},
	"11" : {name : "K", fullname : "King", val : "13"},
	"12" : {name : "A", fullname : "Ace", val : "14"}
}

const suit_name_list = {
	"0" : {name : "C", fullname : "Clubs"},
	"1" : {name : "D", fullname : "Diamonds"},
	"2" : {name : "H", fullname : "Hearts"},
	"3" : {name : "S", fullname : "Spades"}
}

class Card {
    constructor(id) {
        if (id < 52){
        this._location = "Deck";
        this._valid = true;
        this._visible = false;
        this._id = id;
        this._suit = suit_name_list[Math.floor(id/13)];
        this._rank = card_name_list[id % 13];
        }
        else this._valid = false
    }

    get id(){
        return this._id;
    }

    set id(id){
        return;
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
        return this.rank.name + this.suit.name;
    }

    toSortableString() {
        return this._suit.name + "-" + this._rank.val;
    }
}

exports.Card = Card;