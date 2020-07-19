const {createCanvas, loadImage} = require('canvas');
const Discord = require('discord.js');

class Player {
    constructor(member, seat_idx, stack){
        this._member = member;
        this._seat_idx = seat_idx;
        this._stack = stack;
    }

    async send_hand(cards, round_number) {
        this._member.send(`Here is your hand for round ${round_number}, good luck!`, await display_horizontal(cards));
    }

    async prompt_move(){
        return new Promise(resolve => {
            game.channel.send(`Please choose an action ${(this._member.nickname)?this._member.nickname:this._member.user.username}`)
            .then(async (msg) => {
                msg.react("🆙").catch(console.error);
                msg.react("☑️").catch(console.error);
                msg.react("📁").catch(console.error);

                const action_collector = msg.createReactionCollector((reaction, user) => ['🆙','☑️','📁'].includes(reaction._emoji.name) && (!user.bot), {max: 1, time: 60000});
                
                //What we do when the player picks an action
                action_collector.on('end', async (reactions) => {
                    msg.delete() //Player has made a choice, we don't need to display choices now.
                    switch(reactions.first()._emoji.name) {
                        //Player Bet
                        case('🆙'):
                            game.channel.send("__Please type your numerical bet below...__"); 
                            const sizing_collector = game.channel.createMessageCollector(m => m.author.id == this._member.id, { max: 1, time: 60000 });
                            //What we do when player specifies a bet size
                            sizing_collector.on('end', async (msgs) => {
                                msg.delete();
                                msgs.first().delete();
                                game.channel.send(`**${(this._member.nickname)?this._member.nickname:this._member.user.username} bets ${msgs.first().content} chips**`);
                                resolve({'action' : 'Bet', 'amount' : msgs.first().content});
                            });
                        break;

                        //Player Checked
                        case('☑️'):
                            msg.delete();
                            game.channel.send(`**${(this._member.nickname)?this._member.nickname:this._member.user.username} checks**`);
                            resolve({'action' : 'Check', 'amount' : null})
                        break;

                        //Player Folded
                        case('📁'):
                            msg.delete();
                            game.channel.send(`**${(this._member.nickname)?this._member.nickname:this._member.user.username} folds**`);
                            resolve({'action' : 'Fold', 'amount' : null})
                        break;

                    }
                });
            })
        })
    }

    toString() {return (JSON.stringify(this))}
    
    get member(){return this._member}
    set member(value){this._member = value}

    get seat_idx(){return this._seat_idx}
    set seat_idx(value){this._seat_idx = value}

    get stack(){return this._stack}
    set stack(value){this._stack = value}
}

async function display_horizontal(cards) {
	const canvas = createCanvas(cards.length * 135, 181);
	const ctx = canvas.getContext('2d');
	for (let i=0; i< cards.length; i++) {
		const card_image = await loadImage(`./card_images_75/${cards[i].rank.name}_of_${cards[i].suit.fullname.toLowerCase()}.png`);
		ctx.drawImage(card_image, 135*i, 0);
	}

	return new Discord.MessageAttachment(canvas.toBuffer(), 'cards.png');
}

exports.Player = Player;