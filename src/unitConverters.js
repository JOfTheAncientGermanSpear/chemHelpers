var und = require('underscore');

var re = /^([0-9][0-9]*(?:\.[0-9]+)?) ?([a-zA-Z]+)/i
var metricUnitRe = /^(T|G|M|k|h|da|g|c|m|mu|n|p)[a-zA-Z]$/

var metricMap = {
	"T": 1000000000000,
	"G": 1000000000,
	"M": 1000000,
	"k": 1000,
	"h": 100,
	"da": 10,
	"d": .1,
	"c": .01,
	"m": .001,
	"mu": .0001,
	"n": .00001,
	"p": .000001
};

var gramMap = und.extend(
	{
		"oz": 453.5923/16,
		"lb": 453.5923,
		"g": 1

	},
	metricMap);

var metricUnit = function(unit){
	return metricUnitRe.test(unit) ? unit.match(metricUnitRe)[1] : undefined;
};

var metricOrSelf = function(unit){
	var metric = metricUnit(unit);
	return metric ? metric : unit;
}

var massConverter = function(input, newUnit){
	if (!re.test(input)){
		throw(input + ' is not a valid mass');
	};
	var resArray = input.match(re);
	var value = Number(resArray[1]);
	var oldUnit = metricOrSelf(resArray[2]);
	var newUnit = metricOrSelf(newUnit);
	return gramMap[oldUnit]/gramMap[newUnit] * value;
};

module.exports = {
	mass: massConverter,
	metricUnit: metricUnit
}