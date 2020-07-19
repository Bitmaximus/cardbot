const {createCanvas, loadImage} = require('canvas');

class Table{
    constructor(players){
        this._players = players;
        this._initial_graphic = this.init_table();
        this._graphic = this._initial_graphic;
    }

    async init_table(){
        const canvas = createCanvas(1301, 718);
        const ctx = canvas.getContext('2d');
        //Load and draw the table image
        const table_image = await loadImage(`./other_images/poker_table_large.png`);
        ctx.drawImage(table_image, 0, 0);
        let ava_size = 128;
        for (let i = 0; i < this._players.length; i++){
            //Load the avatar for this player
            let img = await loadImage((this._players[i].member.user.displayAvatarURL()).replace(/\.\w{3,4}$/i,".png"));
            //Draw the avatar in the correct position and shape
            ctx.save();
            ctx.beginPath();
            ctx.arc(seat_coords[i][0], seat_coords[i][1], ava_size/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, seat_coords[i][0]-ava_size/2, seat_coords[i][1]-ava_size/2, ava_size, ava_size);
            ctx.restore();
            //Add nickname
            ctx.fillStyle = ('rgb(194,193,190');
            roundRect(ctx,seat_coords[i][0]-ava_size/2,seat_coords[i][1]+ava_size/4,5/4*ava_size,36,15,true);
            ctx.font = 'bold 28px sans-serif';
            ctx.fillStyle = ('black');
            ctx.fillText((this._players[i].member.nickname)?this._players[i].member.nickname:this._players[i].member.user.username, seat_coords[i][0]-ava_size/2 + 12, seat_coords[i][1]+ava_size/4 + 27);
        }
        return canvas;
    }

    reset(){this._graphic = this._initial_graphic;}

    get graphic(){return this._graphic}
    set graphic(value){this._graphic = value}
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

const seat_coords = [
  //Seat 1-3 (Bottom of table)
  [351,653],
  [651,653],
  [951,653],
  //Seat 4-5 (Right of table)
  [1218,530],
  [1218,214],
  //Seat 6-8 (Top of table)
  [951,60],
  [651,60],
  [351,60],
  //Seat 9-10 (Left of table)
  [71,530],	
  [71,214]
]

//Not yet implemented
const card_coords = [
//Flop
[290,259],
[430,259],
[572,259],
//Turn
[719,259],
//River
[865,259]
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

exports.Table = Table;