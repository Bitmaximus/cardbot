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
		execute: (message, params) => {TEST(message, params);}
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
	const {Table} = require('./models/table.js');
	const {Game} = require('./models/game.js');
	const {GameStructure, default_blinds, default_blind_timer, default_starting_stack} = require('./models/game_structure.js');
	const user = message.member;
	const channel = message.channel;

	message.member
	let members = [];
	members.push(message.member);
	global.game = new Game(members, new GameStructure(default_blinds, default_blind_timer, default_starting_stack), message.channel);

	game.table.test(channel, user);
}

module.exports = {
    console,
	commands,
	adminCommands
}
