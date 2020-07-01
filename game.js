const utils = require('./utils.js');

class Game{
    constructor(players){
        this._players = players
        this._blinds = new BlindStructure();
        this._round = new Round(0, this);
    }
}

exports.Game = Game;