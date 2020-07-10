const {Deck} = require('./deck.js');

class Round {
    constructor(number, game, dealer_idx){
        this._number = number;
        this._hands_dealt = 0;
        this._flop = false;
        this._turn = false;
        this._river = false;
        this._board = [];
        this.dealer_idx = dealer_idx
    }

}
exports.Round = Round;