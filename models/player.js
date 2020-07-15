const {createCanvas, loadImage} = require('canvas');
const Discord = require('discord.js');

class Player {
    constructor(member, seat_idx, stack){
        this._member = member;
        this._seat_idx = seat_idx;
        this._stack = stack;
    }

    async send_hand(cards, round_number) {
        this._member.send(`Here is your hand for round ${round_number}, good luck!`, await display_horizontal(cards));
    }

    get member(){
        return this._member;
    }
    set member(value){
        this._member = value;
    }
    get seat_idx(){
        return this._seat_idx;
    }
    set seat_idx(value){
        this._seat_idx = value;
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

async function display_horizontal(cards) {
	const canvas = createCanvas(cards.length * 135, 181);
	const ctx = canvas.getContext('2d');
	for (let i=0; i< cards.length; i++) {
		const card_image = await loadImage(`./card_images_75/${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png`);
		ctx.drawImage(card_image, 135*i, 0);
	}

	return new Discord.MessageAttachment(canvas.toBuffer(), 'cards.png');
}


exports.Player = Player;