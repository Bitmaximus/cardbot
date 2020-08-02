var utils = require('./utils.js');
const Discord = require('discord.js');

//Logger timestamp
const console = (function () {
	var timestamp = function () { };
	timestamp.toString = function () {
		return "[" + (new Date).toLocaleTimeString() + "]";
	};
	return {
		log: this.console.log.bind(this.console, '%s', timestamp)
	}
})();

//Unrestricted comamands (Prefix: '/')
var commands = {

    'commands': {
	    description: 'Displays the list of things you can ask of me :)',
	    parameters: [],
	    permittedRoles: [],	
		help: 'That\'s just silly',
	    execute: function (message, params) {
			let response = "```asciidoc\nAvailable Commands \n====================";
	            for (var command in commands) {
	                    if (command != "commands" & command != "help"){
	                    if (commands.hasOwnProperty(command)) { //sanity check
	                        /* check permissions */
	                        var permitted = utils.isPermitted(message.member, commands[command].permittedRoles);
	                        if (!permitted) continue;

	                        /* appends command to commandlist */
	                        response += '\n' + utils.DEFAULTPREFIX + command;
	                        for (var i = 0; i < commands[command].parameters.length; i++) {
	                            response += ' <'	 + commands[command].parameters[i] + '>';
	                        }
	                    }
	                    response += " :: " + commands[command].description;
	                }
				}
				response += "```";
	            message.channel.send(response);
	        }
	},

	'help': {
		description: 'Displays the list of things you can ask me :)',
		parameters: ["Command"],
		help: 'Please stop, you know what you did.',
		permittedRoles: [],
		execute: function (message, params) {
			if (params.args.length < 2) {
				commands.commands.execute(message, params);
				return;
			}
			else{
				commandNameToView = utils.joinParams(params.args);
				if (commands.hasOwnProperty(commandNameToView)) { //sanity check
					commandToView = commands[commandNameToView];

					if (!utils.isPermitted(message.member, commandToView.permittedRoles)) {message.channel.send(`You do not have a high enough role to use the command ${commandToView}.`); return;}

					/* builds command specify help info */
					response = `*${utils.DEFAULTPREFIX}${commandNameToView}*: ${commandToView.help}`;
				}
				else {response = `The command \`${commandNameToView}\` does not exist.`;}
			}
			message.channel.send(response);
			}
	},

	'ping': {
		description: 'Ping the bot to verify if it is online at the moment',
		parameters: [],
		require: [],
		help: '**Example Use**: `' + utils.DEFAULTPREFIX + 'ping`',
		permittedRoles: [],
		execute: function (message, params) {
			message.channel.send('Pong!');
		}
	},

	'start': {
		description: 'Starts a game',
		parameters: ["max_players"],
		require: [],
		help: '**Example Use**: `' + utils.DEFAULTPREFIX + 'start`',
		permittedRoles: [],
		execute: function (message, params) {
			utils.start_game(message, (params.args.length>1)? params.args[1]:1);
		}
	},

	'adv': {
		description: 'Advances the state of the current round',
		permittedRoles: [],
		parameters: [],
		help: '\adv',
		execute: async function (message, params) {
			if (!game) return;
			game.round.advance_state();
			message.delete();
		}
	}, 

	'reset': {
		description: 'Resets the deck',
		permittedRoles: [],
		parameters: [],
		help: '\reset',
		execute: async function (message, params) {
			const content = message.content;
			const args = message.content.split(' ');
			game.start_new_round();
			message.channel.send(`New round!`);
			message.delete();
		}
	},

	'state': {
		description: 'Displays info about the state of the round',
		permittedRoles: [],
		parameters: [],
		help: '\deal to deal two cards',
		execute: async function (message, params) {
			if (!game) return;
			message.channel.send(`
			Cards left in deck: ${game.deck.cards.length}
			Board state: ${game.round.board.map(card => card.toString()).join(', ')}
			Hands: ${game.round.hands.map(hand => hand.toString()).join(', ')}
			`);						
			message.delete();
		}
	}
}

//Commands restricted to admins/ranks (Prefix: '!')
var adminCommands = {

	'test': {
		description: 'For server bot developers to test new commands they are developing.',
		permittedRoles: ["Admin", "Developer"],
		parameters: ['species','growth_stage'],
		help: 'I do nothing right now. But I do everything, sometimes. I\'m sorry if this wasn\'t \'help\'ful',
		execute: (message, params) => {TEST(message, params);} /*async function (message, params) {
			const content = message.content;
			const args = message.content.split(' ');
			let hand = game.deck.deal(2);

			console.log(hand);
			

			const exampleEmbed = new Discord.MessageEmbed()
			.setTitle('Your Hand')
			.attachFiles([`./card_images_75/${hand[0].rank.name}_of_${hand[0].suit.fullname.toLowerCase()}.png`,
			`./card_images_75/${hand[1].rank.name}_of_${hand[1].suit.fullname.toLowerCase()}.png`])

			message.channel.send({embed: exampleEmbed});
		}*/
	},

	'clear' : {
		description: 'Clears messages from the current channel',
		parameters: ['# of msgs to clear'],
		require: [],
		help: '**Example Use**: `' + utils.ADMINPREFIX + 'clear 10`',
		permittedRoles: ["Admin", "General"],
		execute: function (message, params) {

			const content = message.content;
			const args = message.content.split(' ');
			message.channel.bulkDelete(args[1]); 
			                      
		}
	}
}

async function TEST(message, params) {
	/* REQUIRE IN HEADER */ const {createCanvas, loadImage} = require('canvas');
	/* REQUIRE IN HEADER */ const seat_coords = [
	/* REQUIRE IN HEADER */ 	//Seat 1-3 (Bottom of table)
	/* REQUIRE IN HEADER */ 	[351,653],
	/* REQUIRE IN HEADER */ 	[651,653],
	/* REQUIRE IN HEADER */ 	[951,653],
	/* REQUIRE IN HEADER */ 	//Seat 4-5 (Right of table)
	/* REQUIRE IN HEADER */ 	[1218,530],
	/* REQUIRE IN HEADER */ 	[1218,214],
	/* REQUIRE IN HEADER */ 	//Seat 6-8 (Top of table)
	/* REQUIRE IN HEADER */ 	[951,60],
	/* REQUIRE IN HEADER */ 	[651,60],
	/* REQUIRE IN HEADER */ 	[351,60],
	/* REQUIRE IN HEADER */ 	//Seat 9-10 (Left of table)
	/* REQUIRE IN HEADER */ 	[71,214],	
	/* REQUIRE IN HEADER */ 	[71,530]
	/* REQUIRE IN HEADER */ ]
	/* REQUIRE IN HEADER */ const pending_bet_coords = [
	/* REQUIRE IN HEADER */ 	//Stack 1-3 (Bottom of table)
	/* REQUIRE IN HEADER */ 	[319,557],
	/* REQUIRE IN HEADER */ 	[619,557],
	/* REQUIRE IN HEADER */ 	[919,557],
	/* REQUIRE IN HEADER */ 	//Stack 4-5 (Right of table)
	/* REQUIRE IN HEADER */ 	[1122,530],
	/* REQUIRE IN HEADER */ 	[1122,214],
	/* REQUIRE IN HEADER */ 	//Stack 6-8 (Top of table)
	/* REQUIRE IN HEADER */ 	[919,156],
	/* REQUIRE IN HEADER */ 	[619,156],
	/* REQUIRE IN HEADER */ 	[319,156],
	/* REQUIRE IN HEADER */ 	//Stack 9-10 (Left of table)
	/* REQUIRE IN HEADER */ 	[167,530],	
	/* REQUIRE IN HEADER */ 	[167,214]
	/* REQUIRE IN HEADER */ ]

	/* REQUIRE IN HEADER */ const canvasSize = [1301, 718]
	/* REQUIRE IN HEADER */ const CANVAS_SCALE = 1; // 1.1 seems nice
	/* REQUIRE IN HEADER */ const TABLE_SCALE = 1; // 1 seems nice


	const user = message.member;
	const playerCount = (params.args.length > 1) ? ((params.args[1] > 10)? 10 : params.args[1]) : 1;
	channel = message.channel;

	// generate canvas and load the table image.
	const xCenterPoint = canvasSize[0] / 2; // centerpoint of the canvas on the x-axis before scaling
	const yCenterPoint = canvasSize[1] / 2;
	let canvas = createCanvas(canvasSize[0] * CANVAS_SCALE, canvasSize[1] * CANVAS_SCALE);
	let ctx = canvas.getContext('2d');
	const table_image = await loadImage(`./other_images/poker_table_large.png`)
							.catch((err) => {
								console.log(`"poker_table_large.png" failed to load.`);
								console.error(err);
							});

	// draw the table
	ctx.drawImage(table_image, TEST_transformPoint(0, TABLE_SCALE, CANVAS_SCALE, xCenterPoint), TEST_transformPoint(0, TABLE_SCALE, CANVAS_SCALE, yCenterPoint), table_image.width * TABLE_SCALE, table_image.height * TABLE_SCALE);

	// draw the player avatars
	for (let i = 0; i < playerCount; i++){
		let playerXCoord = TEST_transformPoint(seat_coords[i][0], TABLE_SCALE, CANVAS_SCALE, xCenterPoint);
		let playerYCoord = TEST_transformPoint(seat_coords[i][1], TABLE_SCALE, CANVAS_SCALE, yCenterPoint);

		await TEST_drawAvatar(ctx, user, playerXCoord, playerYCoord, TABLE_SCALE);
	}
	// draw_new_table()


	// print_table()
	await channel.send(new Discord.MessageAttachment(canvas.toBuffer(), 'table.png'))
				 .catch(console.error);
	// print_table()
}

function TEST_roundRect(ctx, x, y, width, height, radius, fill, stroke) {
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

// preform a transformation on a point so that it is anchored to the center of the canvas and not the corner
function TEST_transformPoint(originalPoint, tableScalar, canvasScalar, canvasOriginalCenterPoint) {
	return ((originalPoint - canvasOriginalCenterPoint) * tableScalar) + (canvasScalar * canvasOriginalCenterPoint);
}

async function TEST_drawAvatar(ctx, player, playerXCoord, playerYCoord, scale, greenBorder, greyOut) {
	if (scale == undefined) scale = 1;
	if (greenBorder == undefined) greenBorder = false;
	if (greyOut == undefined) greyOut = false;


	/* REQUIRE IN HEADER */ const ava_size = Math.floor(128 * scale);
	/* REQUIRE IN HEADER */ const font_size = Math.floor(28 * scale);
	/* REQUIRE IN HEADER */ const {createCanvas, loadImage} = require('canvas');

	const playerAvatar = await loadImage((player.user.displayAvatarURL()).replace(/\.\w{3,4}$/i,".png"))
							   .catch((err) => {
									console.log(`${player.user.displayAvatarURL().replace(/\.\w{3,4}$/i,".png")} failed to load.`);
									throw err;
							   });

	//Draw the avatar in the correct position and shape

	// adding green border around the player avatar
	if (greenBorder) {
		// create a clipping region for the border to be drawn in
		ctx.save();
		ctx.beginPath();
		ctx.arc(playerXCoord,
				playerYCoord,
				(ava_size / 2) * 1.1,
				0,
				Math.PI * 2);
		ctx.clip();

		// add green circle
		ctx.fillStyle = 'green';
		ctx.fillRect(playerXCoord - ((ava_size / 2) * 1.1),
					 playerYCoord - ((ava_size / 2) * 1.1),
					 ava_size * 1.1,
					 ava_size * 1.1);
		ctx.restore();
	}

	// create clipping region for avatar to be drawn in
	ctx.save();
	ctx.beginPath();
	ctx.arc(playerXCoord,
			playerYCoord,
			(ava_size / 2),
			0,
			Math.PI * 2);
	ctx.clip();

	// apply a grey backdrop behind the player avatar
	if (greyOut) {
		ctx.fillStyle = 'grey';
		ctx.fillRect(Math.floor(playerXCoord - (ava_size / 2)),
					 Math.floor(playerYCoord - (ava_size / 2)),
					 ava_size,
					 ava_size);

		// make the player avatar transparent
		ctx.globalAlpha = 0.5; // 0.8 seems nice
	}

	ctx.drawImage(playerAvatar,
				  playerXCoord - (ava_size / 2),
				  playerYCoord - (ava_size / 2),
				  ava_size,
				  ava_size);
	ctx.restore();
	ctx.globalAlpha = 1;

	//Add nameplate
	ctx.fillStyle = ('rgb(194,193,190');
	ctx.font = `bold ${font_size}px sans-serif`;
	ctx.textBaseline = 'top';
	const playerName = player.nickname ? player.nickname : player.user.username;
	const mt = ctx.measureText(playerName);
	const textWidth = mt.actualBoundingBoxRight + mt.actualBoundingBoxLeft;
	const frameWidth = textWidth + (((textWidth * 0.1) < (5 * scale))
										? (5 * scale)
										: (((textWidth * 0.1) > (10 * scale))
											? (10 * scale)
											: (textWidth * 0.1)
										)
									);
	const textHeight = mt.actualBoundingBoxDescent;
	const frameHeight = textHeight + (3 * scale);
	TEST_roundRect(ctx,
				   playerXCoord - (frameWidth / 2),
				   playerYCoord + (ava_size / 4),
				   frameWidth,
				   frameHeight,
				   15 * scale,
				   true);
	ctx.fillStyle = ('black');
	ctx.fillText(playerName,
				 playerXCoord - (textWidth / 2),
				 playerYCoord + (ava_size / 4));
}

module.exports = {
    console,
	commands,
	adminCommands
}
