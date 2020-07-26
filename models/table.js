/**********************************************************************************************************************************/
// Functionality to add:
//
//
// These need to be displayed on the table:
// -Dealer position (red tag over players on bottom of table, under players on top of table)
// -Whether a player is in a hand (i.e. whether they folded), could be an image transformation greying out the player image
// -The current active player, not sure how to show that, maybe an colored outline around their player image (green border)
// -An image with a small text box (like the one for player name) to display pending bets in front of each player) 
// -A small text box to display main pot (same one could appear in the locations I specified in the file for side pots
// -word-wrap on player names, scale player name text? increase canvas size for a buffer space.
//
// Changes made: created test function with implemented scaling
// -Dynamically resize player name border to fit larger player names.
// -Added scalable canvas and objects
//
/**********************************************************************************************************************************/


const {createCanvas, loadImage} = require('canvas');

class Table{
    constructor(players){
        this._players = players;
		this._graphic = draw_new_table.call(this)
							.catch(console.error); // the canvas object containing the table.
        this._cards_drawn = 0; // number of cards currently drawn to the table.
		this._message = null; // previous message containing the table image posted to the text-channel.
		this._table_image = null; // loaded image file of the blank table.
		this._player_images = []; // array of loaded player avatar images.
    }

    // params: array of card objects
    // description: adds images of the face-up cards (the board) to the table
    // returns: the canvas object.
    // throws an error if: the image fails to load.
    async add_cards(cards){
		//console.log(this._graphic);
		const ctx = await this._graphic.then((canvas) => canvas.getContext('2d'));
		// start drawing cards at the first undrawn card.
		for (let i = this._cards_drawn; i < cards.length && i <= 4; i++) {
			const card_image = await loadImage(`./card_images_75/${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png`)
									.catch((err) => {
										console.log(`table.add_cards(): Image failed to load: "${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png"`);
										throw err;
									});
			ctx.drawImage(card_image, card_coords[i][0], card_coords[i][1], 130, 186);
			this._cards_drawn++;
		}

		return this._graphic;
    }

    // params: channel, [message (optional)]
    // description: posts the current table graphic as a message to the given channel, with an optional header message.
    // returns: void
    // throws an error if: unable to send message
    async print_table(channel, message){
		const Discord = require('discord.js');

		// delete previous table message if it exists
		if (this._message != null) {
			await this._message.delete()
							   .catch(console.error);  // non-fatal error.
		}

		// send a new table message
    	if (message != undefined) {
    		await channel.send(message, new Discord.MessageAttachment(await this._graphic.then((g) => g.toBuffer()), 'table.png'))
                    	 .then(msg => this._message = msg)
                    	 .catch((err) => {
                            console.log("table.print_table(): Failed to send message.");
                            throw err;
                         });
    	} else {
        	await channel.send(new Discord.MessageAttachment(await this._graphic.then((g) => g.toBuffer()), 'table.png'))
                    	 .then(msg => {this._message = msg})
                    	 .catch((err) => {
                            console.log();
                            throw err;
                         });
    	}
    }

	reset(){
		draw_new_table.call(this);
	}

    get graphic(){return this._graphic}
    set graphic(value){this._graphic = value}
}

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

// params: none
// description: Creates a canvas object and populates it with the table and player avatar graphics. Reuses this._graphic on subsequent calls.
//				 must be invoked using draw_new_table.call(this), to provide access to Table's private members.
// returns: the table's canvas object.
// throws an error if: an image failed to load.
async function draw_new_table(){
	const table_is_not_initialized = (this._table_image == null);
	let canvas;
	let ctx;

	if (table_is_not_initialized) {
		// generate canvas and load the table image.
		canvas = createCanvas(1301, 718);
		ctx = canvas.getContext('2d');

		this._table_image = await loadImage(`./other_images/poker_table_large.png`)
								.catch((err) => {
									console.log(`"poker_table_large.png" failed to load.`);
									throw err;
								});
	} else {
		canvas = this._graphic;
		ctx = await canvas.then((canvas) => canvas.getContext('2d'));
	}

	// draw the table
	ctx.drawImage(this._table_image, 0, 0);
	
	// draw the player avatars
	let ava_size = 128;
	for (let i = 0; i < this._players.length; i++){
		if (table_is_not_initialized) {
			//Load the avatar for this player
			let img = await loadImage((this._players[i].member.user.displayAvatarURL()).replace(/\.\w{3,4}$/i,".png"))
							.catch((err) => {
								console.log(`${this._players[i].member.user.displayAvatarURL().replace(/\.\w{3,4}$/i,".png")} failed to load.`);
								throw err;
							});
			this._player_images.push(img);
		}

		//Draw the avatar in the correct position and shape
		ctx.save();
		ctx.beginPath();
		ctx.arc(seat_coords[i][0], seat_coords[i][1], ava_size/2, 0, Math.PI * 2);
		ctx.clip();
		ctx.drawImage(this._player_images[i], seat_coords[i][0]-ava_size/2, seat_coords[i][1]-ava_size/2, ava_size, ava_size);
		ctx.restore();
		
		//Add nickname
		ctx.fillStyle = ('rgb(194,193,190');
		roundRect(ctx,seat_coords[i][0]-ava_size/2,seat_coords[i][1]+ava_size/4,5/4*ava_size,36,15,true);
		ctx.font = 'bold 28px sans-serif';
		ctx.fillStyle = ('black');
		ctx.fillText((this._players[i].member.nickname)?this._players[i].member.nickname:this._players[i].member.user.username, seat_coords[i][0]-ava_size/2 + 12, seat_coords[i][1]+ava_size/4 + 27);
	}

	this._cards_drawn = 0;
	return canvas;
}


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
	[71,214],	
	[71,530]
]

const card_coords = [
  //Flop
  [290,259],
  [430,259],
  [570,259],
  //Turn
  [710,259],
  //River
  [850,259]
]

//Not yet implemented
const pot_coords = [
  //Main
  [575,455],
  //Side 1
  [720,455],
  //Side 2
  [870,455],
  //Side 3
  [436,455],
  //Side 4
  [290,455]
]

//Not yet implemented
const pending_bet_coords = [
  //Stack 1-3 (Bottom of table)
  [319,557],
  [619,557],
  [919,557],
  //Stack 4-5 (Right of table)
  [1122,530],
  [1122,214],
  //Stack 6-8 (Top of table)
  [919,156],
  [619,156],
  [319,156],
  //Stack 9-10 (Left of table)
  [167,530],	
  [167,214]
]

exports.Table = Table;