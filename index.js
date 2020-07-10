const secret = require('./secret.json');
const asciiTable = require('ascii-table');
const commandList = require('./command-list.js')
const utils = require('./utils.js');
var CronJob = require('cron').CronJob;
const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const {Deck} = require('./models/deck.js');

//Initialize Discord client object globally
global.client = new Discord.Client();
global.game = null;
global.game_state = {
  hands_dealt : 0,
  flop : false,
  turn : false,
  river : false,
  board : []
}


client.login(secret.token);	
 
client.on('ready', async function (e) {
	console.info('Connected');
	console.info('Logged in as: ');
  console.info(client.user.username + ' - (' + client.user.id + ')');
});

/*
 * Parses through a message with the default command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
function handleCommand(message, params) {
	params[0] = params[0].substr(1);//drop prefix
	if (params[0] in commandList.commands) {
		var command = commandList.commands[params[0]];
		//if the user has the permissions to execute the command
		if (utils.isPermitted(message.member, command.permittedRoles)) {
			var commandParams = {
				args: params,
				parameters: command.parameters,
			};
			command.execute(message, commandParams);
		}
	}
}

/*
 * Parses through a message with the admin command prefix
 * @message: message object
 * @params: list of strings split up by spaces
 */
function handleAdminCommand(message, params) {
	params[0] = params[0].substr(1);//drop prefix
	if (params[0] in commandList.adminCommands) {
		var command = commandList.adminCommands[params[0]];
		if (utils.isPermitted(message.member, command.permittedRoles)) {
			var commandParams = {
				args: params,
				parameters: command.parameters,
			};
			command.execute(message, commandParams);
		}
	}
}

// callback on message
client.on('message', message => {
		let channel = message.channel;
		let messageContent = message.content;		

		/* commands */
		if (messageContent.startsWith(utils.DEFAULTPREFIX)) {
      var args = messageContent.split(' ');
			handleCommand(message, args);
		}

    /* admin commands */
    if (messageContent.startsWith(utils.ADMINPREFIX)) {
      var args = messageContent.split(' ');
      handleAdminCommand(message, args);
    }
});
