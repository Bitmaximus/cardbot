const Discord = require('discord.js');

const DEFAULTPREFIX = '/';
const ADMINPREFIX = '!';

const card_name_list = {
	"0" : {name : "2", fullname : "Two"},
	"1" : {name : "3", fullname : "Three"},
	"2" : {name : "4", fullname : "Four"},
	"3" : {name : "5", fullname : "Five"},
	"4" : {name : "6", fullname : "Six"},
	"5" : {name : "7", fullname : "Seven"},
	"6" : {name : "8", fullname : "Eight"},
	"7" : {name : "9", fullname : "Nine"},
	"8" : {name : "10", fullname : "Ten"},
	"9" : {name : "J", fullname : "Jack"},
	"10" : {name : "Q", fullname : "Queen"},
	"11" : {name : "K", fullname : "King"},
	"12" : {name : "A", fullname : "Ace"}
}

const suit_name_list = {
	"0" : {name : "C", fullname : "Clubs"},
	"1" : {name : "D", fullname : "Diamonds"},
	"2" : {name : "H", fullname : "Hearts"},
	"3" : {name : "S", fullname : "Spades"}
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

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
  }


module.exports = {
	//Stored Values
	DEFAULTPREFIX,
	ADMINPREFIX,
	joinParams,
	getRoleId,
	hasRole,
	isPermitted,
	card_name_list,
	suit_name_list,
	getRandomIntInclusive
}	
