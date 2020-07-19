class Move{
    constructor(action_id, amount){
        this._action_type = action_types[action_id];
        this._amount = amount;
    }

    get action_type(){return this._action_type}
    //action_type is int idx {0,3}. See action_types above.
    set action_type(value){this._action_type = action_types[action_id]}

    get amount(){return this._amount}
    set amount(value){this._amount = value}
}

const action_types = [
    "Bet",
    "Raise",
    "Check",
    "Fold"
]

exports.Move = Move;