const {createCanvas, loadImage} = require('canvas');
const Discord = require('discord.js');
const {Move} = require('./move.js');


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
            game.channel.send(`Please choose an action ${this.nick_or_name()}`)
            .then(async (msg) => {
                await msg.react("🆙").catch(console.error);
                await msg.react("☑️").catch(console.error);
                await msg.react("📁").catch(console.error);

                const action_collector = msg.createReactionCollector((reaction, user) => 
                {if (!user.bot && (user.id != this._member.user.id)) reaction.users.remove(user);
                return ['🆙','☑️','📁'].includes(reaction._emoji.name) && (user.id == this._member.user.id)}, {max: 1, time: 60000});
                
                //What we do when the player picks an action
                action_collector.on('end', async (reactions,reason) => {
                    msg.delete() //Player has made a choice, we don't need to display choices now.

                    if (reason === 'time') {
                        game.channel.send(`***${this.nick_or_name()} did not act in time!***`);
                        resolve(new Move("Fold", this, null)); 
                        return;
                    }
                    
                    switch(reactions.first()._emoji.name) {
                        //Player Bet
                        case('🆙'):
                            game.channel.send("__Please type your numerical bet below...__"); 
                            const sizing_collector = game.channel.createMessageCollector(m => (m.author.id == this._member.user.id), { max: 1, time: 60000 });
                            //What we do when player specifies a bet size
                            sizing_collector.on('end', async (msgs) => {
                                msgs.first().delete();
                                resolve(new Move("Bet", this, msgs.first().content));
                            });
                        break;

                        //Player Checked
                        case('☑️'):
                            resolve(new Move("Check", this, null))
                        break;

                        //Player Folded
                        case('📁'):
                            resolve(new Move("Fold", this, null))
                        break;

                    }

                });
            })
        })
    }

    nick_or_name() {return(this._member.nickname)? this._member.nickname : this._member.user.username};

    toString() {return (JSON.stringify(this))}
    
    get member(){return this._member}
    set member(value){this._member = value}

    get seat_idx(){return this._seat_idx}
    set seat_idx(value){this._seat_idx = value}

    get stack(){return this._stack}
    set stack(value){this._stack = value}

    get is_dealer(){return this._is_dealer}
    set is_dealer(value){this._is_dealer = value}
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