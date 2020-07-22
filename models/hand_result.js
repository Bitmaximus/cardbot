class HandResult{
    constructor(type, quality, kickers){
        this._type = type;
        this._quality = quality;
        this._kickers = kickers; 
    }

    toString() {
        switch(this._type){
            case 0: return `__**${hand_rankings[this._type]}**__ - (*${card_name_list[this._quality[0]-2].name}*) - Kickers: (${this._kickers.map(x => card_name_list[x-2].name)})`
            case 1: return `__**${hand_rankings[this._type]}**__ - (*${card_name_list[this._quality[0]-2].name}s*) - Kickers: (${this._kickers.map(x => card_name_list[x-2].name)})`
            case 2: return `__**${hand_rankings[this._type]}**__ - (*${card_name_list[this._quality[0]-2].name}s & ${card_name_list[this._quality[1]-2].name}s*) (${this._kickers.map(x => card_name_list[x-2].name)} kicker)`
            case 3: return `__**${hand_rankings[this._type]}**__ - (*${card_name_list[this._quality[0]-2].name}s*) - Kickers: (${this._kickers.map(x => card_name_list[x-2].name)})`
            case 4: return `(*${card_name_list[this._quality[0]-2].name} high*) __**${hand_rankings[this._type]}**__ `
            case 5: return `__**${hand_rankings[this._type]}**__ - (*${this._kickers.map(x => card_name_list[x-2].name)} of ${this._quality}*)`
            case 6: return `__**${hand_rankings[this._type]}**__ - (*${card_name_list[this._quality[0]-2].name}s full of ${card_name_list[this._quality[1]-2].name}s*)`
            case 7: return `__**${hand_rankings[this._type]}**__ - (*${card_name_list[this._quality[0]-2].name}s*) (${this._kickers.map(x => card_name_list[x-2].name)} kicker)`
            case 8: return `(*${card_name_list[this._quality[0]-2].name} high*) __**${hand_rankings[this._type]}**__ of ${this._quality[1]}`
        }
    }

    get type() {return this._type}
    set type(value) {this._type = value}

    get quality() {return this._quality}
    set quality(value) {this._quality = value}

    get kickers() {return this._kickers}
    set kickers(value) {this._kickers = value}
}

const card_name_list = {
	0 : {name : "2", fullname : "Two", val : "2"},
	1 : {name : "3", fullname : "Three", val : "3"},
	2 : {name : "4", fullname : "Four", val : "4"},
	3 : {name : "5", fullname : "Five", val : "5"},
	4 : {name : "6", fullname : "Six", val : "6"},
	5 : {name : "7", fullname : "Seven", val : "7"},
	6 : {name : "8", fullname : "Eight", val : "8"},
	7 : {name : "9", fullname : "Nine", val : "9"},
	8 : {name : "T", fullname : "Ten", val : "10"},
	9 : {name : "J", fullname : "Jack", val : "11"},
	10 : {name : "Q", fullname : "Queen", val : "12"},
	11 : {name : "K", fullname : "King", val : "13"},
	12 : {name : "A", fullname : "Ace", val : "14"}
}

const hand_rankings = {
	"0" : "High Card",
	"1" : "Pair",
	"2" : "Two-Pair",
	"3" : "Three of a Kind",
	"4" : "Straight",
	"5" : "Flush",
	"6" : "Full House",
	"7" : "Four of a Kind",
	"8" : "Straight Flush"
}

exports.HandResult = HandResult;