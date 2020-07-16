class Pot{
    constructor(){
        this._pending_contributions = [];
        this._contributions = [];
    }

    are_bets_matched(){
        return this._pending_contributions.every( (val, i, arr) => val === arr[0] );
    }

    can_check(){
        return (this._pending_contributions.length < 1)||(this.are_bets_matched());
    }

    collect_bets(){
        for (let i = 0; i < this._pending_contributions; i++){
            this._contributions[i] += this._pending_contributions[i];
        }
        this._pending_contributions = [];
    }
    
    pay_out(players){
        return;
    }

    add_contribution(player_id, amount){
        this._contributions.push([player_id, amount]);
    }

    get contributions() {
        return this._contributions;
    }

    set contributions(value){
        this._contributions = value;
    }

    get pending_contributions() {
        return this._pending_contributions;
    }

    set pending_contributions(value){
        this._pending_contributions = value;
    }
}

exports.Pot = Pot;