const Discord = require('discord.js');
const _ = require('lodash');
const {Game} = require('./models/game.js');
const {GameStructure, default_blinds, default_blind_timer, default_starting_stack} = require('./models/game_structure.js');
const {createCanvas, loadImage} = require('canvas');


const RED = "RED";
const GREEN = "GREEN";
const BLUE = 3447003;
const YELLOW = "#dde61a";
const bot_id = '727656097195884615';

const DEFAULTPREFIX = '/';
const ADMINPREFIX = '!';

async function display_horizontal(cards) {
	const canvas = createCanvas(cards.length * 135, 181);
	const ctx = canvas.getContext('2d');
	for (let i=0; i< cards.length; i++) {
		const card_image = await loadImage(`./card_images_75/${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png`);
		ctx.drawImage(card_image, 135*i, 0);
	}

	return new Discord.MessageAttachment(canvas.toBuffer(), 'cards.png');
}

//===============Discord Functions=====================

//Returns a boolean indicating whether the specified member has the specified role.
function hasRole(member, role) {
	return member.roles.cache.has(getRoleId(member, role));
}

//Does stuff
function isPermitted(member, roles) {
	if (roles.length == -0)
		return true;

	for (var i = 0; i < roles.length; i++) {
		if (hasRole(member, roles[i]))
			return true;
	}
	return false;
}

//Get the id of a role.
function getRoleId(member, role) {
	var role = member.guild.roles.cache.find(myRole => myRole.name === role);
	if (role)
		return role.id;
	else
		return null;
}

//Join the elements of a params array into a single string, for reasons.
function joinParams(args){
    if (args.length > 1){
        var contentArray = new Array();
        for (let i = 1; i<args.length; i++){
		  contentArray.push(args[i] + " ");
        }
        return contentArray.join("").trim();
    } else {
        return "";
    }
}

//Makes a simple embed for displaying errors and things
function genSimpleMsg(title,message){
	var embed = new Discord.MessageEmbed()
	.setTitle(`${title}`)
	.setAuthor(`Doyle`,`${client.guilds.cache.get('727663503254487092').members.cache.get('727656097195884615').user.displayAvatarURL()}`)
	.setColor(BLUE)
	.setFooter(`Responding To: ${message.author.tag}`,`${message.author.displayAvatarURL()}`)
	// .setTimestamp();	
	return embed;
}

function start_game(message, max_players){
	message.channel.send("React to enter the tournament").then(
		async (msg) => {
			await msg.react('▶️').catch(console.error);
			const collector = await msg.createReactionCollector((reaction, user) => (reaction.emoji.name === '▶️' && user.id !== bot_id), { max: max_players, time: 500000});
			
			collector.on('end', async (collected) => {
				let users = Array.from(collected.get('▶️').users.cache.values()).filter(user => user.id != bot_id);
				let members = [];
				for (let i = 0; i < users.length; i++) {members.push(await message.guild.members.fetch(users[i]))}
				global.game = new Game(members, new GameStructure(default_blinds, default_blind_timer, default_starting_stack),message.channel);
				await game.table.print_table(message.channel, "The game has begun!")
								.catch((err) => {
													console.log("start_game(): Unable to print table.");
													game.end(err);
												});
				game.round.advance_state();
			});
		}
	)
}

module.exports = {
	//Stored Values
	DEFAULTPREFIX,
	ADMINPREFIX,
	joinParams,
	getRoleId,
	hasRole,
	isPermitted,
	display_horizontal,
	genSimpleMsg,
	start_game
}