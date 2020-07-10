const {Deck} = require('./deck.js');
const {Round} = require('./round.js');
const {Player} = require('./player.js');
const {createCanvas, loadImage} = require('canvas');

const seat_coords = [
    //Seat 1-3 (Bottom of table)
    [351,653],
    [651,653],
    [951,653],
    //Seat 4-5 (Right of table)
    [1218,530],
    [1218,214],
    //Seat 6-8 (Top of table)
    [951,60],
    [651,60],
    [351,60],
    //Seat 9-10 (Left of table)
    [71,530],	
    [71,214]
]    

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
	  stroke = true;
	}
	if (typeof radius === 'undefined') {
	  radius = 5;
	}
	if (typeof radius === 'number') {
	  radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
	  var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
	  for (var side in defaultRadius) {
		radius[side] = radius[side] || defaultRadius[side];
	  }
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
	  ctx.fill();
	}
	if (stroke) {
	  ctx.stroke();
	}
  
  }

class Game{
    constructor(members, structure){
        this._players = members.map((member,idx) => new Player(member, idx+1, structure.starting_stack));
        this._state = "INITIALIZING";
        this._structure = structure;
        this._deck = new Deck();
        this._table = {};
        this._round = new Round(1,this,Math.floor(Math.random() * members.length)+1);
    }

    get players(){
        return this._players;
    }

    set players(players){
        this._players = players;
    }

    get structure() {
        return this._structure;
    }

    set structure(value){
        this._structure = structure;
    }

    get state() {
        return this._state;
    }

    set state(value){
        this._state = value;
    }

    get round() {
        return this._round;
    }

    set round(value){
        this._round = value;
    }

    get table() {
        return this._table;
    }

    set table(value){
        this._table = value;
    }

    get deck() {
        return this._deck;
    }

    set deck(value){
        this._deck = value;
    }

    async create_table(){
        let players = this.players;
        const canvas = createCanvas(1301, 718);
        const ctx = canvas.getContext('2d');
        const table_image = await loadImage(`./other_images/poker_table_large.png`);
        ctx.drawImage(table_image, 0, 0);
        let ava_size = 128;
        for (let i = 0; i < players.length; i++){
            let img = await loadImage((players[i].member.user.displayAvatarURL()).replace(/\.\w{3,4}$/i,".png"));
            ctx.save();
            ctx.beginPath();
            ctx.arc(seat_coords[i][0], seat_coords[i][1], ava_size/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, seat_coords[i][0]-ava_size/2, seat_coords[i][1]-ava_size/2, ava_size, ava_size);
            ctx.restore();
            ctx.fillStyle = ('rgb(194,193,190');
            roundRect(ctx,seat_coords[i][0]-ava_size/2,seat_coords[i][1]+ava_size/4,5/4*ava_size,36,15,true);
            ctx.font = 'bold 28px sans-serif';
            ctx.fillStyle = ('black');
            ctx.fillText((players[i].member.nickname)?players[i].member.nickname:players[i].member.user.username, seat_coords[i][0]-ava_size/2 + 12, seat_coords[i][1]+ava_size/4 + 27);
        }
        this.table = canvas; 
        return canvas;
    }

}

exports.Game = Game;