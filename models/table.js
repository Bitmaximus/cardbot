/**********************************************************************************************************************************/
// Functionality to add:
//
//
// These need to be displayed on the table
// - revise/improve documentation for functions (particularly update_player)
// - align the cards properly
// - Dealer position (red tag over players on bottom of table, under players on top of table)
// - An image with a small text box (like the one for player name) to display pending bets in front of each player) 
// - A small text box to display main pot (same one could appear in the locations I specified in the file for side pots
// - word-wrap on player names, scale player name text?
//
/**********************************************************************************************************************************/

/* #region  CONSTANTS */
const { createCanvas, loadImage } = require('canvas');
const Discord = require('discord.js');
const { Player } = require('./player.js');

// rendering settings
const CANVAS_SCALE = 1.1; // 1.1 seems nice
const TABLE_SCALE = 1; // 1 seems nice
const CANVAS_SIZE = {x: 1301,
					 y: 718 };
const CENTER_POINT = {x: CANVAS_SIZE.x / 2, // CENTER_POINT of the canvas
					  y: CANVAS_SIZE.y / 2};

// coordinates for the player avatars (center point)
const SEAT_COORDS = [
	{ x: 351, y: 653 },	//0
	{ x: 71, y: 530 },	//1
	{ x: 71, y: 214 },	//2
	{ x: 351, y: 60 },	//3
	{ x: 651, y: 60 },	//4
	{ x: 951, y: 60 },	//5
	{ x: 1218, y: 214 },//6
	{ x: 1218, y: 530 },//7
	{ x: 951, y: 653 },	//8
	{ x: 651, y: 653 }	//9
]

// coordinates for the cards in the board/on the table (top left corner)
const CARD_COORDS = [
	//Flop
	{ x: 290, y: 259 },
	{ x: 430, y: 259 },
	{ x: 570, y: 259 },
	//Turn
	{ x: 710, y: 259 },
	//River
	{ x: 850, y: 259 }
]

// coordinates for the players individual pending bets (top left corner)
const PENDING_BET_COORDS = [
	{ x: 250, y: 550 }, //1
	{ x: 120, y: 440 }, //2
	{ x: 120, y: 300 }, //3
	{ x: 360, y: 150 }, //4
	{ x: 660, y: 150 }, //5
	{ x: 950, y: 150 }, //6
	{ x: 1100, y: 300 },//7
	{ x: 1100, y: 440 },//8
	{ x: 830, y: 550 },	//9
	{ x: 530, y: 550 }  //10
]

// coordinates for the dealer button for each player (top left corner)
const DEALER_BUTTON_COORDS = [
	{ x: 400, y: 550 }, //1
	{ x: 140, y: 490 }, //2
	{ x: 150, y: 220 }, //3
	{ x: 260, y: 150 }, //4
	{ x: 560, y: 150 }, //5
	{ x: 850, y: 150 }, //6
	{ x: 1100, y: 220 },//7
	{ x: 1110, y: 500 },//8
	{ x: 1000, y: 550 },//9
	{ x: 700, y: 550 }  //10
]

// coordinates and dimensions for each player's table space (coordinates on top left corner)
const GAME_REGIONS = [
	{	x: 221, // 0
		y: 524,
		width: 279,
		height: 204
	},
	{	x: -27, // 1
		y: 358,
		width: 248,
		height: 284
	},
	{	x: -27, // 2
		y: 108,
		width: 248,
		height: 250
	},
	{	x: 221, // 3
		y: -20,
		width: 279,
		height: 202
	},
	{	x: 500, // 4
		y: -20,
		width: 304,
		height: 202
	},
	{	x: 804, // 5
		y: -20,
		width: 277,
		height: 202
	},
	{	x: 1081, // 6
		y: 108,
		width: 230,
		height: 250
	},
	{	x: 1081, // 7
		y: 358,
		width: 230,
		height: 284
	},
	{	x: 804, // 8
		y: 524,
		width: 277,
		height: 204
	},
	{	x: 500, // 9
		y: 524,
		width: 304,
		height: 204
	}
]
/* #endregion */

class Table {
	/**
	 * @param {Player[]} players an array of players in the current game.
	 */
	constructor(players) {
		this._players = []
		for (let i = 0; i < players.length; i++) {
			this._players.push(new PlayerTable(players[i], i));
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
	 * @returns {void} void
	 */
	async add_cards(cards) {
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
			ctx.drawImage(card_image, transformCoords(CARD_COORDS[i].x, "x"), transformCoords(CARD_COORDS[i].y, "y"), cardWidth * TABLE_SCALE, cardHeight * TABLE_SCALE);
			this._cards_drawn++;
		}
	}

	/**
	 * updates updates the player on the canvas
	 * @param {Player} player
	 * @param {string} state set the state of the player "Raise", "Bet", "Fold", "Check", "Active", "Dealer"
	 * @param {number} bet (optional) set the bet of the player if the state is "raise"
	 * @returns {void} void
	 */
	async update_player(player, state, bet) {
		// find player in this._players
		let ptPlayer = this._players[0];
		let i = 0;
		for (; (i < this._players.length) && (this._players[i].member != player.member); i++);
		ptPlayer = this._players[i];

		const ctx = await this._tableCanvas.then((canvas) => canvas.getContext('2d'));

		switch (state) {
			case "Raise":
			case "Bet":
				ptPlayer.currentBet.amount = bet;
				drawAvatar(ctx, ptPlayer, false);
				break;
			case "Fold":
				drawAvatar(ctx, ptPlayer, false, true);
				break;
			case "Check":
				drawAvatar(ctx, ptPlayer, false);
				break;
			case "Active":
				drawAvatar(ctx, ptPlayer, true);
				break;
			case "Dealer":
				ptPlayer.isDealer = true;
				drawAvatar(ctx, ptPlayer, false);
				break;
			default:
				console.log("update_player passed invalid state: " + state);
		}
	}

	/**
	 * sets all player bets to 0 and adds their bets to the pot
	 * redraws the table
	 * 
	 */
	async collect_bets() {
		const ctx = await this._tableCanvas.then((canvas) => canvas.getContext('2d'));

		for (let i = 0; i < this._players.length; i++) {
			this._players[i].currentBet.amount = 0;
			drawAvatar(ctx, this._players[i], false, false)
		}

		// this will need to add the bets to the pot and potentially redraw the entire table.
	}

	/**
	 * posts the current table graphic as a message to the given channel, with an optional header message.
	 * throws an error if unable to send the message.
	 * @param {Discord.Channel} channel The channel the active game is being displayed in
	 * @param {Discord.Message} message (optional) A message to send with the table image
	 * @returns {void} void
	 */
	async print_table(channel, message) {
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
				.then(msg => { this._activeMessage = msg })
				.catch((err) => {
					console.log("table.print_table(): Failed to send message.");
					throw err;
				});
		}
	}

	/**
	 * clears the canvas and draws a new table.
	 * @returns {void} void
	 */
	reset() {
		draw_new_table.call(this);
	}

	async test(channel, user) {
		for (let i = 0; i < 10; i++){
			let player = new PlayerTable(this._players[0], i);
			player.isDealer = true;
			player.currentBet.amount = (i + 1) * 100;
			await drawAvatar(await this._tableCanvas.then(c => c.getContext('2d')), player, false, false);
		}
		await this.print_table(channel, "TEST");
	}
}

/**
 * only used within table.js
 * stores canvas rendering data associated with specific players 
 */
class PlayerTable extends Player {
	/**
	 * @param {Player} player a player in the active game
	 * @param {number} seatNumber seating position beginning at 0 in the bottom left, rotating clockwise (0-9)
	 */
	constructor(player, seatNumber) {
		super(player.member, player.seat_idx, player.stack);
		this._name = player.member.nickname ? player.member.nickname : player.member.user.username; // {string} either the nickname or username used to identify the player
		this._tableSpace = {
			img: null,
			x: 0,
			y: 0,
			width: 0,
			height: 0
		}; // game area for the player on the board
		this._avatar = {
			img: loadImage((player.member.user.displayAvatarURL()).replace(/\.\w{3,4}$/i, ".png"))
				.catch((err) => {
					console.log(`${player.member.user.displayAvatarURL().replace(/\.\w{3,4}$/i, ".png")} failed to load.`);
					throw err;
				}),
			x: transformCoords(SEAT_COORDS[seatNumber].x, "x"),
			y: transformCoords(SEAT_COORDS[seatNumber].y, "y")
		};
		this._currentBet = {
			amount: 0,
			x: transformCoords(PENDING_BET_COORDS[seatNumber].x, "x"),
			y: transformCoords(PENDING_BET_COORDS[seatNumber].y, "y")
		};
		this._dealer = {
			x: transformCoords(DEALER_BUTTON_COORDS[seatNumber].x, "x"),
			y: transformCoords(DEALER_BUTTON_COORDS[seatNumber].y, "y")
		};
		this._isDealer = false;
	}

	// accessor functions //
	get isDealer() { return this._isDealer }
	set isDealer(value) { this._isDealer = value }

	get currentBet() { return this._currentBet }
	set currentBet(value) { this._currentBet = value }

	get tableSpace() { return this._tableSpace }
	set tableSpace(value) { this._tableSpace = value }

	// read-only value accessors
	get dealer() { return this._dealer }
	get name() { return this._name }
	get avatar() { return this._avatar }
}

/**
 * transforms the given point(s) so that they remain anchored to the center of the canvas and scale appropriately with the table and canvas scalars
 * This function has two use cases:
 * 		- if given a number and a string "x" or "y" the function will transform that coordinate along that axis
 * 		- if given two numbers the function will transform both the coordinates along the x and y axes respectively.
 * @param {number} arg1 a coordinate to transform || the x-coordinate to transform
 * @param {string} arg2 the axis to transform the coordinate along "x" or "y"
 * @param {number} arg2 the y-coordinate to transform
 * @returns {number} the transformed coordinate
 * @returns {number[]} the transformed coordinates [x, y]
 */
function transformCoords(arg1, arg2) {
	// if provided a coordinate and axis
	if (typeof (arg2) == "string") {
		let originalCoord = arg1;
		let coord = arg1;
		let axis = arg2;
		switch (axis) {
			case 'x':
				coord = ((originalCoord - CENTER_POINT.x) * TABLE_SCALE) + (CANVAS_SCALE * CENTER_POINT.x);
				break;
			case 'y':
				coord = ((originalCoord - CENTER_POINT.y) * TABLE_SCALE) + (CANVAS_SCALE * CENTER_POINT.y);
				break;
			default:
				console.log("transformCoords passed invalid parameter arg2: " + arg2);
		}
		return Math.floor(coord);

		// if provided x and y coordinates
	} else {
		let originalXCoord = arg1;
		let originalYCoord = arg2;
		let xCoord = ((originalXCoord - CENTER_POINT.x) * TABLE_SCALE) + (CANVAS_SCALE * CENTER_POINT.x);
		let yCoord = ((originalYCoord - CENTER_POINT.y) * TABLE_SCALE) + (CANVAS_SCALE * CENTER_POINT.y);
		return [Math.floor(xCoord), Math.floor(yCoord)];
	}
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
* @returns {void} void
*/
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
		stroke = true;
	}

	if (typeof radius === 'undefined') {
		radius = 5;
	}

	if (typeof radius === 'number') {
		radius = {
			tl: radius,
			tr: radius,
			br: radius,
			bl: radius
		};
	} else {
		var defaultRadius = {
			tl: 0,
			tr: 0,
			br: 0,
			bl: 0
		};
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

/**
 * draw an avatar to the table, including their nameplate and any modifiers
 * @param {CanvasRenderingContext2D} ctx the rendering context for the table
 * @param {PlayerTable} player the player to be displayed on the table
 * @param {boolean} greenBorder (optional) if true a green border will be rendered around the player avatar
 * @param {boolean} greyOut (optional) if true the player avatar will be greyed out
 */
async function drawAvatar(ctx, player, greenBorder, greyOut) {
	if (greenBorder == undefined) greenBorder = false;
	if (greyOut == undefined) greyOut = false;

	if (player.tableSpace.img != null) {
		ctx.clearRect(player.tableSpace.x, player.tableSpace.y, player.tableSpace.width, player.tableSpace.height);
		ctx.drawImage(player.tableSpace.img, player.tableSpace.x, player.tableSpace.y, player.tableSpace.width, player.tableSpace.height);
	}

	const ava_size = Math.floor(128 * TABLE_SCALE);
	const font_size = Math.floor(28 * TABLE_SCALE);

	// adding green border around the player avatar
	if (greenBorder) {
		// draw big circle
		ctx.save();
		ctx.beginPath();
		ctx.arc(player.avatar.x,
			player.avatar.y,
			(ava_size / 2) * 1.1,
			0,
			Math.PI * 2);
		// draw smaller circle
		ctx.arc(player.avatar.x,
			player.avatar.y,
			(ava_size / 2),
			0,
			Math.PI * 2);
		// clip using overlapping circles
		ctx.clip("evenodd");

		// draw green rectangle, which will display as a ring (because of the clip)
		ctx.fillStyle = 'green';
		ctx.fillRect(player.avatar.x - ((ava_size / 2) * 1.1),
			player.avatar.y - ((ava_size / 2) * 1.1),
			ava_size * 1.1,
			ava_size * 1.1);

		// remove the clipping region
		ctx.restore();
	}

	// create a circular clipping region for the avatar to be drawn in
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

		// create a new canvas object and draw the avatar to it
		let c = createCanvas(ava_size, ava_size);
		let greyMask = c.getContext("2d");
		greyMask.drawImage(await player.avatar.img,
			0,
			0,
			ava_size,
			ava_size);

		// draw a grey mask on top of the avatar (no grey will be applied to transparent regions)
		greyMask.globalCompositeOperation = "source-atop";
		greyMask.fillStyle = 'grey';
		greyMask.fillRect(0,
			0,
			ava_size,
			ava_size);

		// draw the mask to the table
		ctx.drawImage(c,
			player.avatar.x - (ava_size / 2),
			player.avatar.y - (ava_size / 2),
			ava_size,
			ava_size);

		// set the alpha before rendering the avatar to make it transparent
		ctx.globalAlpha = 0.4; // 0.8 seems nice
	}

	// draw the player avatar
	ctx.drawImage(await player.avatar.img,
		player.avatar.x - (ava_size / 2),
		player.avatar.y - (ava_size / 2),
		ava_size,
		ava_size);

	// remove the clipping region and reset the alpha
	ctx.restore();
	ctx.globalAlpha = 1;

	//Add a nameplate
	ctx.font = `bold ${font_size}px sans-serif`;
	ctx.textBaseline = 'top'; // sets the baseline to the top of the text, this is not a rendered element
	const mt = ctx.measureText(player.name); // a text metrics object that contains measurement properties that take into account text, font size, etc..
	const textWidth = mt.actualBoundingBoxRight + mt.actualBoundingBoxLeft;
	const frameWidth = textWidth + ((textWidth < (50 * TABLE_SCALE))
		? (5 * TABLE_SCALE)
		: ((textWidth > (100 * TABLE_SCALE))
			? (10 * TABLE_SCALE)
			: (textWidth * 0.1)
		)
	);
	const textHeight = mt.actualBoundingBoxDescent; // measures from the textBaseline to the bottom of the text
	const frameHeight = textHeight + (3 * TABLE_SCALE);
	ctx.fillStyle = ('rgb(194,193,190');
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

	// add the bet
	if (player.currentBet.amount) {
		const bet_mt = ctx.measureText("BET " + player.currentBet.amount);
		const betWidth = bet_mt.actualBoundingBoxRight + bet_mt.actualBoundingBoxLeft;

		ctx.fillStyle = ('rgb(194,193,190');
		roundRect(ctx,
			player.currentBet.x,
			player.currentBet.y,
			betWidth,
			frameHeight,
			15 * TABLE_SCALE,
			true);
		ctx.fillStyle = ('black');
		ctx.fillText("BET" + player.currentBet.amount,
			player.currentBet.x,
			player.currentBet.y);
	}

	// add dealer token
	if (player.isDealer) {
		const dealer_mt = ctx.measureText("D");
		const dealerWidth = dealer_mt.actualBoundingBoxRight + dealer_mt.actualBoundingBoxLeft;

		ctx.fillStyle = ('red');
		roundRect(ctx,
			player.dealer.x,
			player.dealer.y,
			dealerWidth,
			frameHeight,
			15 * TABLE_SCALE,
			true);
		ctx.fillStyle = ('black');
		ctx.fillText("D",
			player.dealer.x,
			player.dealer.y);
	}
}

/**
 * Creates a canvas object and populates it with the table and player avatar graphics. Reuses this.tableCanvas on subsequent calls.
 * must be invoked using draw_new_table.call(this), to provide access to Table's private members.
 * throws an error if an image failed to load.
 * @returns {Canvas} a canvas object containing the table
 */
async function draw_new_table() {
	const table_is_not_initialized = (this._table_image == null);
	let canvas;
	let ctx;

	// create or clear existing canvas and set ctx
	if (table_is_not_initialized) {
		canvas = createCanvas(Math.floor(CANVAS_SIZE.x * CANVAS_SCALE), Math.floor(CANVAS_SIZE.y * CANVAS_SCALE));
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
	ctx.drawImage(this._table_image,
		transformCoords(0, "x"),
		transformCoords(0, "y"),
		Math.floor(this._table_image.width * TABLE_SCALE),
		Math.floor(this._table_image.height * TABLE_SCALE));

	// draw the player avatars
	for (let i = 0; i < this._players.length; i++) {
		let player = this._players[i];

		// draw the avatar
		player.tableSpace.img = null;
		player.isDealer = false;
		await drawAvatar(ctx, player);

		// save their game region
		Object.assign(player.tableSpace, {
			x: transformCoords(GAME_REGIONS[i].x, "x"),
			y: transformCoords(GAME_REGIONS[i].y, "y"),
			width: Math.floor(GAME_REGIONS[i].width * TABLE_SCALE),
			height: Math.floor(GAME_REGIONS[i].height * TABLE_SCALE)
		});
		player.tableSpace.img = createCanvas(player.tableSpace.width, player.tableSpace.height);
		let c = player.tableSpace.img;
		c.getContext('2d').drawImage(await canvas,
			player.tableSpace.x,
			player.tableSpace.y,
			player.tableSpace.width,
			player.tableSpace.height,
			0,
			0,
			player.tableSpace.width,
			player.tableSpace.height);

	}

	this._cards_drawn = 0;
	return canvas;
}

//Not yet implemented
const pot_coords = [
	//Main
	[575, 455],
	//Side 1
	[720, 455],
	//Side 2
	[870, 455],
	//Side 3
	[436, 455],
	//Side 4
	[290, 455]
]

exports.Table = Table;