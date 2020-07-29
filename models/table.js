/**********************************************************************************************************************************/
// Functionality to add:
//
//
// These need to be displayed on the table:
// - finish cleaning up commentary
// - align the cards properly
// - create some form of updateTable(player, bet, folded, etc..)
// - save each players region seperately so that we can modify them individually
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
const Discord = require('discord.js');
const {Player} = require('./player.js');

const CANVAS_SCALE = 1.1; // 1.1 seems nice
const TABLE_SCALE  = 1; // 1 seems nice
const canvasSize   = {x: 1301,
					  y: 718};
const centerPoint  = {x: canvasSize.x / 2,
					  y: canvasSize.y / 2}; // centerpoint of the canvas

class Table{
	/**
	 * @param {Player[]} players an array of players in the current game.
	 */
    constructor(players){
		this._players = []
		for (let i = 0; i < players.length; i++) {
			let [playerXCoord, playerYCoord] = transformCoords(seat_coords[i][0], seat_coords[i][1]);
			this._players.push(new PlayerTable(players[i], playerXCoord, playerYCoord));
		}

		this._table_image = null; // loaded image file of the blank table.
		this._tableCanvas = draw_new_table.call(this)
							.catch(console.error); // the canvas object containing the table.
		
        this._cards_drawn = 0; // number of cards currently drawn to the table.
		this._activeMessage = null; // message containing the table image currently posted to the text-channel.
    }

	/**
	 * adds images of the face-up cards (the board) to the table
	 * throws an error if an image fails to load.
	 * @param {Card[]} cards an array of cards to be added to the table as the current board.
	 * @returns {void}
	 */
    async add_cards(cards){
		const cardWidth = 130; // not the actual width and height of the card images, this is the dimensions they should be rendered with at the base canvas scale.
		const cardHeight = 186;
		const ctx = await this._tableCanvas.then((canvas) => canvas.getContext('2d'));

		// start drawing cards at the first undrawn card.
		for (let i = this._cards_drawn; i < cards.length && i <= 4; i++) {
			const card_image = await loadImage(`./card_images_75/${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png`)
									.catch((err) => {
										console.log(`table.add_cards(): Image failed to load: "${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png"`);
										throw err;
									});
			ctx.drawImage(card_image, transformCoords(card_coords[i][0], "x"), transformCoords(card_coords[i][1], "y"), cardWidth * TABLE_SCALE, cardHeight * TABLE_SCALE);
			this._cards_drawn++;
		}
    }

	/**
	 * posts the current table graphic as a message to the given channel, with an optional header message.
	 * throws an error if unable to send the message.
	 * @param {Discord.Channel} channel The channel the active game is being displayed in
	 * @param {Discord.Message} message (optional) A message to send with the table image
	 * @returns {void}
	 */
    async print_table(channel, message){

		// delete previous table message if it exists
		if (this._activeMessage != null) {
			await this._activeMessage.delete()
									 .catch(console.error);  // non-fatal error.
		}

		// send a new table message
    	if (message != undefined) {
    		await channel.send(message, new Discord.MessageAttachment(await this._tableCanvas.then((c) => c.toBuffer()), 'table.png'))
                    	 .then(msg => this._activeMessage = msg)
                    	 .catch((err) => {
                            console.log("table.print_table(): Failed to send message.");
                            throw err;
                         });
    	} else {
        	await channel.send(new Discord.MessageAttachment(await this._tableCanvas.then((c) => c.toBuffer()), 'table.png'))
                    	 .then(msg => {this._activeMessage = msg})
                    	 .catch((err) => {
							console.log("table.print_table(): Failed to send message.");
							throw err;
						 });
    	}
    }

	/**
	 * clears the canvas and draws a new table.
	 * @returns {void}
	 */
	reset(){
		draw_new_table.call(this);
	}
}

/**
 * only used within table.js
 * stores canvas rendering data associated with specific players 
 */
class PlayerTable extends Player {
	/**
	 * @param {Player} player a player in the active game
	 * @param {number} xCoord player avatar's x-coordinate (top left), transformed to the scale of the canvas and table
	 * @param {number} yCoord player avatar's y-coordinate (top left), transformed to the scale of the canvas and table
	 */
	constructor(player, xCoord, yCoord){
		super(player.member, player.seat_idx, player.stack);
		this._name = player.member.nickname ? player.member.nickname : player.member.user.username; // {string} either the nickname or username used to identify the player
		this._tableSpace = {img: null,
							x: 0,
							y: 0}; // game area for the player on the board
		this._avatar = {img: loadImage((player.member.user.displayAvatarURL()).replace(/\.\w{3,4}$/i,".png"))
							 .catch((err) => {
								console.log(`${player.member.user.displayAvatarURL().replace(/\.\w{3,4}$/i,".png")} failed to load.`);
			  					throw err;
							 }),
						x: xCoord,
						y: yCoord};
	}

	// accessor functions //
	get tableSpace(){return this._tableSpace}
	set tableSpace(value){this._tableSpace = value}

	// read-only value accessors
	get name(){return this._name}
	get avatar(){return this._avatar}
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
* @returns {void}
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



////////////////////// THIS IS WHERE I STOPPED REVISING THE COMMENTS ////////////////////////////////////////
//                           everything above this I cleaned up                                            //




// params: none
// description: Creates a canvas object and populates it with the table and player avatar graphics. Reuses this.tableCanvas on subsequent calls.
//				 must be invoked using draw_new_table.call(this), to provide access to Table's private members.
// returns: the table's canvas object.
// throws an error if: an image failed to load.
async function draw_new_table(){
	const table_is_not_initialized = (this._table_image == null);
	let canvas;
	let ctx;
	

	if (table_is_not_initialized) {
		// generate canvas and load the table image.
		canvas = createCanvas(canvasSize.x * CANVAS_SCALE, canvasSize.y * CANVAS_SCALE);
		ctx = canvas.getContext('2d');

		this._table_image = await loadImage(`./other_images/poker_table_large.png`)
								.catch((err) => {
									console.log(`"poker_table_large.png" failed to load.`);
									throw err;
								});
	} else {
		canvas = this._tableCanvas;
		ctx = await canvas.then((canvas) => canvas.getContext('2d'));
		ctx.clearRect();
	}

	// draw the table
	ctx.drawImage(this._table_image, transformCoords(0, "x"), transformCoords(0, "y"), this._table_image.width * TABLE_SCALE, this._table_image.height * TABLE_SCALE);
	
	// draw the player avatars
	for (let i = 0; i < this._players.length; i++){
		await drawAvatar(ctx, this._players[i]);
	}

	this._cards_drawn = 0;
	return canvas;
}


const seat_coords = [
  [351,653], //0
  [71,530],	//1
  [71,214], //2
  [351,60], //3
  [651,60], //4
  [951,60], //5
  [1218,214], //6
  [1218,530], //7
  [951,653], //8
  [651,653] //9
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

// preform a transformation on a point so that it is anchored to the center of the canvas and not the corner
// accepts (originalXCoord, originalYCoord) or (originalCoord, string axis) as parameters
function transformCoords(arg1, arg2) {
	if (typeof(arg2) == "string") {
		let originalCoord = arg1;
		let coord = arg1;
		let axis = arg2;
		switch (axis) {
			case 'x':
				coord = ((originalCoord - centerPoint.x) * TABLE_SCALE) + (CANVAS_SCALE * centerPoint.x);
				break;
			case 'y':
				coord = ((originalCoord - centerPoint.y) * TABLE_SCALE) + (CANVAS_SCALE * centerPoint.y);
				break;
			default:
				console.log("transformCoords passed invalid parameter arg2: " + arg2);
		}
		return coord;
	} else {
		let originalXCoord = arg1;
		let originalYCoord = arg2;
		let xCoord = ((originalXCoord - centerPoint.x) * TABLE_SCALE) + (CANVAS_SCALE * centerPoint.x);
		let yCoord = ((originalYCoord - centerPoint.y) * TABLE_SCALE) + (CANVAS_SCALE * centerPoint.y);
		return [xCoord, yCoord];
	}
}

async function drawAvatar(ctx, player, greenBorder, greyOut) {
	if (greenBorder == undefined) greenBorder = false;
	if (greyOut == undefined) greyOut = false;

	const ava_size = Math.floor(128 * TABLE_SCALE);
	const font_size = Math.floor(28 * TABLE_SCALE);

	//Draw the avatar in the correct position and shape

	// adding green border around the player avatar
	if (greenBorder) {
		// create a clipping region for the border to be drawn in
		ctx.save();
		ctx.beginPath();
		ctx.arc(player.avatar.x,
				player.avatar.y,
				(ava_size / 2) * 1.1,
				0,
				Math.PI * 2);
		ctx.clip();

		// add green circle
		ctx.fillStyle = 'green';
		ctx.fillRect(player.avatar.x - ((ava_size / 2) * 1.1),
					 player.avatar.y - ((ava_size / 2) * 1.1),
					 ava_size * 1.1,
					 ava_size * 1.1);
		ctx.restore();
	}

	// create clipping region for avatar to be drawn in
	ctx.save();
	ctx.beginPath();
	ctx.arc(player.avatar.x,
			player.avatar.y,
			(ava_size / 2),
			0,
			Math.PI * 2);
	ctx.clip();

	// apply a grey backdrop behind the player avatar
	if (greyOut) {
		ctx.fillStyle = 'grey';
		ctx.fillRect(player.avatar.x - (ava_size / 2),
					 player.avatar.y - (ava_size / 2),
					 ava_size,
					 ava_size);

		// make the player avatar transparent
		ctx.globalAlpha = 0.5; // 0.8 seems nice
	}

	ctx.drawImage(await player.avatar.img,
				  player.avatar.x - (ava_size / 2),
				  player.avatar.y - (ava_size / 2),
				  ava_size,
				  ava_size);
	ctx.restore();
	ctx.globalAlpha = 1;

	//Add nameplate
	ctx.fillStyle = ('rgb(194,193,190');
	ctx.font = `bold ${font_size}px sans-serif`;
	ctx.textBaseline = 'top';
	const mt = ctx.measureText(player.name);
	const textWidth = mt.actualBoundingBoxRight + mt.actualBoundingBoxLeft;
	const frameWidth = textWidth + (((textWidth * 0.1) < (5 * TABLE_SCALE))
										? (5 * TABLE_SCALE)
										: (((textWidth * 0.1) > (10 * TABLE_SCALE))
											? (10 * TABLE_SCALE)
											: (textWidth * 0.1)
										)
									);
	const textHeight = mt.actualBoundingBoxDescent;
	const frameHeight = textHeight + (3 * TABLE_SCALE);
	roundRect(ctx,
			  player.avatar.x - (frameWidth / 2),
			  player.avatar.y + (ava_size / 4),
			  frameWidth,
			  frameHeight,
			  15 * TABLE_SCALE,
			  true);
	ctx.fillStyle = ('black');
	ctx.fillText(player.name,
				 player.avatar.x - (textWidth / 2),
				 player.avatar.y + (ava_size / 4));
}

exports.Table = Table;


		// /* TEST */ // draw bet using preselected coords
		// /* TEST */ let [betXCoord, betYCoord] = transformCoords(pending_bet_coords[i][0], pending_bet_coords[i][1]);
		// /* TEST */ const font_size = Math.floor(28 * TABLE_SCALE);
		// /* TEST */ ctx.fillStyle = ('rgb(194,193,190');
		// /* TEST */ ctx.font = `bold ${font_size}px sans-serif`;
		// /* TEST */ ctx.textBaseline = 'top';
		// /* TEST */ const mt = ctx.measureText("BET " + i);
		// /* TEST */ const textWidth = mt.actualBoundingBoxRight + mt.actualBoundingBoxLeft;
		// /* TEST */ const frameWidth = textWidth + (((textWidth * 0.1) < (5 * TABLE_SCALE))
		// /* TEST */ 									? (5 * TABLE_SCALE)
		// /* TEST */ 									: (((textWidth * 0.1) > (10 * TABLE_SCALE))
		// /* TEST */ 										? (10 * scale)
		// /* TEST */ 										: (textWidth * 0.1)
		// /* TEST */ 									)
		// /* TEST */ 								  );
		// /* TEST */ const textHeight = mt.actualBoundingBoxDescent;
		// /* TEST */ const frameHeight = textHeight + (3 * TABLE_SCALE);
		// /* TEST */ roundRect(ctx,
		// /* TEST */ 		   		  betXCoord,
		// /* TEST */ 		   		  betYCoord,
		// /* TEST */ 		   		  frameWidth,
		// /* TEST */ 		   		  frameHeight,
		// /* TEST */ 		   		  15 * TABLE_SCALE,
		// /* TEST */ 		  		  true);
		// /* TEST */ ctx.fillStyle = ('black');
		// /* TEST */ ctx.fillText("BET " + i,
		// /* TEST */ 			 	betXCoord,
		// /* TEST */ 				betYCoord);


		// /* TEST */ // draw bet using player coords
		// /* TEST */ const ava_size = Math.floor(128 * TABLE_SCALE);
		// /* TEST */ let betXCoord = playerXCoord + ((playerXCoord > centerPoint.x) ? 0 - ((1) * ava_size): ((1/6) * ava_size));
		// /* TEST */ let betYCoord = playerYCoord - (ava_size/8);
		// /* TEST */ const font_size = Math.floor(28 * TABLE_SCALE);
		// /* TEST */ ctx.fillStyle = ('rgb(194,193,190');
		// /* TEST */ ctx.font = `bold ${font_size}px sans-serif`;
		// /* TEST */ ctx.textBaseline = 'top';
		// /* TEST */ const mt = ctx.measureText("BET " + i);
		// /* TEST */ const textWidth = mt.actualBoundingBoxRight + mt.actualBoundingBoxLeft;
		// /* TEST */ const frameWidth = textWidth + (((textWidth * 0.1) < (5 * TABLE_SCALE))
		// /* TEST */ 									? (5 * TABLE_SCALE)
		// /* TEST */ 									: (((textWidth * 0.1) > (10 * TABLE_SCALE))
		// /* TEST */ 										? (10 * scale)
		// /* TEST */ 										: (textWidth * 0.1)
		// /* TEST */ 									)
		// /* TEST */ 								  );
		// /* TEST */ const textHeight = mt.actualBoundingBoxDescent;
		// /* TEST */ const frameHeight = textHeight + (3 * TABLE_SCALE);
		// /* TEST */ roundRect(ctx,
		// /* TEST */ 		   		  betXCoord,
		// /* TEST */ 		   		  betYCoord,
		// /* TEST */ 		   		  frameWidth,
		// /* TEST */ 		   		  frameHeight,
		// /* TEST */ 		   		  15 * TABLE_SCALE,
		// /* TEST */ 		  		  true);
		// /* TEST */ ctx.fillStyle = ('black');
		// /* TEST */ ctx.fillText("BET " + i,
		// /* TEST */ 			 	betXCoord,
		// /* TEST */ 				betYCoord);