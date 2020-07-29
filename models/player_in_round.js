const {Player} = require('./player.js');


class Player_In_Round extends Player {
    constructor(player, hand, is_active){
        super(player.member, player.seat_idx, player.stack);
        this.hand = hand;
        this.is_active = is_active;
    }

}
exports.Player_In_Round = Player_In_Round;