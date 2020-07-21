class Move{
    constructor(action_type, actor, amount){
        this._action_type = action_type;
        this._actor = actor;
        this._amount = amount;
    }

    get action_type(){return this._action_type}
    set action_type(value){this._action_type = value}

    get actor(){return this._actor}
    set actor(value){this._actor = value}

    get amount(){return this._amount}
    set amount(value){this._amount = value}

    toString() {switch(this._action_type){
        case ("Bet"):
            return `${this._actor.nick_or_name()} bet ${this._amount}`;
        case ("Raise"):
            return `${this._actor.nick_or_name()} raised ${this._amount}`;
        case ("Check"):
            return `${this._actor.nick_or_name()} checked`;
        case ("Fold"):
            return `${this._actor.nick_or_name()} folded`;
    }}
}

exports.Move = Move;