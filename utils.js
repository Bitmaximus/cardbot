const Discord = require('discord.js');
const _ = require('lodash');
const {Game} = require('./models/game.js');
const {GameStructure} = require('./models/game_structure.js');
const {HandResult} = require('./models/hand_result.js');
const {createCanvas, loadImage} = require('canvas');


const RED = "RED";
const GREEN = "GREEN";
const BLUE = 3447003;
const YELLOW = "#dde61a";
const bot_id = '727656097195884615';

const DEFAULTPREFIX = '/';
const ADMINPREFIX = '!';

const game_state_list = [
	"INITIALIZING",
	"PRE-FLOP",
	"FLOP",
	"TURN",
	"RIVER"
]

const default_blinds = [
5,
10,		
15,		
20,		
30,		
50,		
75,		
125,		
200,	
300,	
500,	
800,	
1500
]

const default_timer = 20;

const default_starting_stack = 1000;

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

function start_game(message){
	message.channel.send("React to enter the tournament").then(
		async (msg) => {
			await msg.react('▶️').catch(console.error);
			const collector = await msg.createReactionCollector((reaction, user) => (reaction.emoji.name === '▶️' && user.id !== bot_id), { max: 10, time: 5000});
			
			collector.on('end', async (collected) => {
				let users = Array.from(collected.get('▶️').users.cache.values()).filter(user => user.id != bot_id);
				let members = [];
				for (let i = 0; i < users.length; i++) {members.push(await message.guild.members.fetch(users[i]))}
				global.game = new Game(members, new GameStructure(default_blinds, default_timer, default_starting_stack));
				message.channel.send("The game has begun!", new Discord.MessageAttachment(await game.create_table().then(canvas => canvas.toBuffer()), 'table.png'));
			});
		}
	)
}

function check_straights(cards){
	if (!cards || cards.length < 5) return;
	let ranks_by_suit = [cards.filter(x => x.suit.name === 'C').map(x => x.id).sort((a,b)=>b-a), 
		cards.filter(x => x.suit.name === 'D').map(x => x.id).sort((a,b)=>b-a),
		cards.filter(x => x.suit.name === 'H').map(x => x.id).sort((a,b)=>b-a), 
		cards.filter(x => x.suit.name === 'S').map(x => x.id).sort((a,b)=>b-a),
		_.uniq(cards.map(x => x.rank.val).sort((a,b)=>b-a))
	]

	for (let i=0; i < ranks_by_suit.length; i++){
		if (ranks_by_suit[i].includes('14')) ranks_by_suit[i].push('1');
		let partial = [ranks_by_suit[i][0]];
		for(let j=1; j<ranks_by_suit[i].length; j++){
			if (ranks_by_suit[i][j] == partial[partial.length-1]-1) partial.push(ranks_by_suit[i][j]);
			else partial = [ranks_by_suit[i][j]];
			if (partial.length == 5 && i<4) return new HandResult(8,[partial[0], suit_name_list[i].fullname],[]);
			if (partial.length == 5 && i==4) return new HandResult(4,[partial[0]],[]);
		}
	}
	return false;                                                                                                                                                                                                                              
}

function check_flush(cards){
	if (!cards || cards.length < 5) return; 
	let freq = {};
	for (let i = 0; i < cards.length; i++) {freq[(cards[i].suit.fullname)] = freq[(cards[i].suit.fullname)] + 1 || 1;}
	let freq_arr = Object.entries(freq);
	let max_flush = _.maxBy(freq_arr, function(p) { return p[1]; });
	return (max_flush[1]>4)? new HandResult(5, max_flush[0], cards.filter(x => x.suit.fullname == max_flush[0]).map(x => x.rank.val).sort((a,b)=>b-a).slice(0,5)):false;
}

function eval_dupes(cards){
	if (!cards || cards.length < 5) return; 
	let freq = {}; for (let i = 0; i < cards.length; i++) {freq[(cards[i].rank.val)] = freq[(cards[i].rank.val)] + 1 || 1};
	let dupes = Object.entries(freq).sort((a,b) => b[0]-a[0]);

	let max_duped = _.maxBy(dupes, function(p) { return p[1]; });
	dupes.splice(dupes.indexOf(max_duped),1);
	let next_max_duped = _.maxBy(dupes, function(p) { return p[1]; });
	dupes.splice(dupes.indexOf(next_max_duped),1);

	switch(max_duped[1]) {
		case 4: 
		return new HandResult(7,[max_duped[0]],[Math.max(...dupes.map(x => x[0]))]);
		case 3: return (next_max_duped[1]>1)? 
			   new HandResult(6,[max_duped[0],next_max_duped[0]],[]) : 
			   new HandResult(3, max_duped[0], [next_max_duped[0], Math.max(...dupes.map(x => x[0]))]);
		case 2: return (next_max_duped[1] == 2)? 
			   new HandResult(2, [max_duped[0], next_max_duped[0]], [Math.max(...dupes.map(x => x[0]))]) : 
			   new HandResult(1, [max_duped[0]],[next_max_duped[0]]);
		default: 
		return new HandResult(0,[max_duped[0]], []);
	}
}

function eval_best_hand(cards){
	if (!cards || cards.length < 5) return; 
	let results = [];
	let dupes_eval = eval_dupes(cards); if (dupes_eval) results.push(dupes_eval);
	let f_eval = check_flush(cards); if (f_eval) results.push(f_eval);
	let s_eval = check_straights(cards); if (s_eval) results.push(s_eval);
	return _.maxBy(results, function(p) {return p.type});
}

module.exports = {
	//Stored Values
	DEFAULTPREFIX,
	ADMINPREFIX,
	joinParams,
	getRoleId,
	hasRole,
	isPermitted,
	game_state_list,
	eval_dupes,
	check_flush,
	check_straights,
	eval_best_hand,
	display_horizontal,
	genSimpleMsg,
	start_game
}	
