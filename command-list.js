var logger = require('winston');
var utils = require('./utils.js');
const Discord = require('discord.js');
const {Deck} = require('./models/deck.js');
const {Game} = require('./models/game.js');

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
		parameters: [],
		require: [],
		help: '**Example Use**: `' + utils.DEFAULTPREFIX + 'start`',
		permittedRoles: [],
		execute: function (message, params) {
			utils.start_game(message);
		}
	},

	'deal': {
		description: 'Deals a hand of two cards',
		permittedRoles: [],
		parameters: [],
		help: '\deal to deal two cards',
		execute: async function (message, params) {
			if (!game) return;
			let cards = game.deck.pick(2,"Hand");
			game_state.hands_dealt++;
			
			message.channel.send({embed: utils.genSimpleMsg(`Hand dealt to ${message.author.username}\nThe deck now has ${deck.cards.length} cards left in it.`, message)});
			message.author.send(`Here is your hand, good luck!`, await utils.display_horizontal(cards));
			message.delete();
		}
	},

	'flop': {
		description: 'Deals a flop of three cards',
		permittedRoles: [],
		parameters: [],
		help: '\flop',
		execute: async function (message, params) {
			if (!game) return;
			game.deck.pick(1,"Muck");
			let cards = game.deck.pick(3,"Flop");
			game_state.flop = true;
			for(card of cards) game_state.board.push(card);

			message.channel.send(`**__Here comes the flop!__**`, await utils.display_horizontal(cards));
			message.delete();
		}
	}, 

	'flap': {
		description: 'Deals a flop of seven cards',
		permittedRoles: [],
		parameters: [],
		help: '\flap',
		execute: async function (message, params) {
			if (!game) return;
			game.deck.pick(1,"Muck");
			let cards = game.deck.pick(7,"Flap");
			game_state.flop = true;
			for(card of cards) game_state.board.push(card);

			message.channel.send(`**__Here comes the flap!__**`, await utils.display_horizontal(cards));
			message.delete();
		}
	}, 

	'turn': {
		description: 'Deals a turn of one card',
		permittedRoles: [],
		parameters: [],
		help: '\turn',
		execute: async function (message, params) {
			if (!game) return;
			game.deck.pick(1,"Muck");
			let cards = game.deck.pick(1,"Turn");
			game_state.turn = true;
			game_state.board.push(cards[0]);

			message.channel.send(`**__Burn and TURN baby!!!__**`, await utils.display_horizontal(cards));
			message.delete();
		}
	}, 

	'river': {
		description: 'Deals a river of one card',
		permittedRoles: [],
		parameters: [],
		help: '\river',
		execute: async function (message, params) {
			if (!game) return;
			game.deck.pick(1,"Muck");
			let cards = game.deck.pick(1,"River");
			game_state.river = true;
			game_state.board.push(cards[0]);
			message.channel.send(`**__This is it, the river!__**`, await utils.display_horizontal(cards));
			message.delete();
		}
	}, 

	'cheat': {
		description: 'Puts one card of your choosing onto the board',
		permittedRoles: [],
		parameters: [],
		help: '\cheat ',
		execute: async function (message, params) {
			if (!game) return;
			const args = message.content.split(' ');
			let cards = game.deck.cheat(args[1]);
			game_state.board.push(cards[0]);
			message.channel.send(`**__Ace up ma sleeve ;)__**`, await utils.display_horizontal(cards));
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
			deck = new Deck();
			game_state = {
				hands_dealt : 0,
				flop : false,
				turn : false,
				river : false,
				board : []
			  }
			message.channel.send(`The deck has been reset`);
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
			Hands dealt: ${game_state.hands_dealt}
			Hand phase: ${(game_state.river)? "River" : (game_state.turn)? "Turn" : (game_state.flop)? "Flop" : "Deal"}
			Board state: ${game_state.board.map(card => card.toString()).join('|')}
			Best hand: ${utils.eval_best_hand(game_state.board)}
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
		execute: async function (message, params) {
			const content = message.content;
			const args = message.content.split(' ');
			let deck = new Deck();
			let hand = game.deck.deal(2);

			console.log(hand);
			

			const exampleEmbed = new Discord.MessageEmbed()
			.setTitle('Your Hand')
			.attachFiles([`./card_images_75/${hand[0].rank.name}_of_${hand[0].suit.fullname.toLowerCase()}.png`,
			`./card_images_75/${hand[1].rank.name}_of_${hand[1].suit.fullname.toLowerCase()}.png`])

			message.channel.send({embed: exampleEmbed});
		}
	},

	'commands': {
	    description: 'Displays the list of things you can ask of me :)',
	    parameters: [],
	    permittedRoles: [],
		help: 'That\'s just silly. Go fetch me a SHRUBBERY!!!',
	    execute: function (message, params) {
			let response = "```asciidoc\nAvailable Admin Commands \n====================";
	            for (var command in adminCommands) {
	                    if (command != "commands" & command != "help"){
	                    if (adminCommands.hasOwnProperty(command)) { //sanity check
	                        /* check permissions */
	                        var permitted = utils.isPermitted(message.member, adminCommands[command].permittedRoles);
	                        if (!permitted) continue;

	                        /* appends command to commandlist */
	                        response += '\n' + utils.ADMINPREFIX + command;
	                        for (var i = 0; i < adminCommands[command].parameters.length; i++) {
	                            response += ' <' + adminCommands[command].parameters[i] + '>';
	                        }
	                    }
	                    response += " :: " + adminCommands[command].description;
	                }
				}
				response += "```";
	            message.channel.send(response);
	        }
	},

	'help': {
	    description: 'Displays the list of things you can command me to do :(',
	    parameters: ["Command"],
		help: 'Please stop, you DEFINITELY know what you did. You are bad and you should feel bad.',
	    permittedRoles: [],
	    execute: function (message, params) {
			if (params.args.length < 2) {	
				adminCommands.commands.execute(message, params);
				return;
			}
			else{
				commandNameToView = utils.joinParams(params.args);
				if (adminCommands.hasOwnProperty(commandNameToView)) { //sanity check
					commandToView = adminCommands[commandNameToView];

					if (!utils.isPermitted(message.member, commandToView.permittedRoles)) {message.channel.send(`You do not have a high enough role to use the command: "${utils.joinParams(params.args)}".`); return;}

					/* builds command specify help info */
					response = `*${utils.ADMINPREFIX}${commandNameToView}*: ${commandToView.help}`;
				}
				else {response = `The command \`${commandNameToView}\` does not exist.`;}
			}
	        message.channel.send(response);
	        }
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
	},

	'poll': {
		description: 'Posts and pins a message, adding :thumbsup: :thumbsdown: :shrug: for people to vote.',
		parameters: [],
		permittedRoles: [],
		execute: function (message, params){
			message.channel.send(params.args.slice(1).join(' ')).then(async function(msg){
				await msg.react("👍");
				await msg.react("👎");
				await msg.react("🤷");
				await msg.pin();
				await message.delete().catch(console.error);
			});
		}
	}
}

module.exports = {
    console,
	commands,
	adminCommands
}
