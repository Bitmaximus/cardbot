class Player {
    constructor(member, idx, stack){
        this._member = member;
        this._idx = idx;
        this._stack = stack;
    }
    get member(){
        return this._member;
    }
    set member(value){
        this._member = value;
    }
    get idx(){
        return this._idx;
    }
    set idx(value){
        this._idx = value;
    }

    get stack(){
        return this._stack;
    }
    set stack(value){
        this._stack = value;
    }

    toString() {
        return (JSON.stringify(this));
    }
}

exports.Player = Player;