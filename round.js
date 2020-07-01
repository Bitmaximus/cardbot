const {Deck} = require('./deck.js');

class Round{
    constructor(number, game){
        this._round_number = number;
        this._hands_dealt = 0;
        this._deck = new Deck();
        this._flop = false;
        this._turn = false;
        this._river = false;
        this._board = [];
        let dealer_idx = utils.getRandomIntInclusive(0, game.players.length-1)
        game.players[dealer_idx].is_dealer = true; 
        this._dealer = players[dealer_idx];
    }

}
exports.Round = Round;