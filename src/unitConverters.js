var und = require('underscore');

var re = /^([0-9][0-9]*(?:\.[0-9]+)?) ?([a-zA-Z]+)/i
var metricUnitRe = /^(T|G|M|k|h|da|g|c|m|mu|n|p)[a-zA-Z]$/

var metricMap = {
	T: 1000000000000,
	G: 1000000000,
	M: 1000000,
	k: 1000,
	h: 100,
	da: 10,
	d: .1,
	c: .01,
	m: .001,
	mu: .0001,
	n: .00001,
	p: .000001
};

var suffixMetricMap = function(suffix){
	return und.reduce(metricMap, function(acc, val, key){
		acc[key + suffix] = val;
		return acc;
	}, {});
};

var gramMap = und.extend(
	{
		oz: 453.5923/16,
		lb: 453.5923,
		g: 1

	},
	suffixMetricMap('g'));

var literMap = und.extend({L: 1}, suffixMetricMap('L'));

var pascalMap = und.extend(
	{
		atm: 1/101325,
		Pa: 1,
		torr: 1/133.3223684211,
		mmHg: 1/133.3223684211,
		inHg: 1/3386.389
	},
	suffixMetricMap('Pa'));

var timeMap = und.extend({s: 1}, suffixMetricMap('s'));

var fromCelciusMap = {
	"K": function(C){ return C + 273.15; },
	"f": function(C){ return 9/5 * C + 32},
	"C": und.identity
};

var toCelciusMap = {
	"K": function(K){ return K - 273.15; },
	"f": function(f){ return 5/9 * (f - 32); },
	"C": und.identity
};

var converter = function(conversionMap, type){
	return function(input, newUnit) {
		if (!re.test(input)){
			throw(input + ' is not a valid ' + type);
		};
		var resArray = input.match(re);
		var value = Number(resArray[1]);
		var oldUnit = resArray[2];
		return conversionMap[oldUnit]/conversionMap[newUnit] * value;	
	};
};

var temperatureConverter = function(temp, newUnit) {
	var tempRe = /([0-9]+(?:\.[0-9]+)?) *([CKf])/
	if (!tempRe.test(temp)){
		throw(temp + ' is not a valid temperature');
	}
	var resArray = temp.match(tempRe);
	var value = Number(resArray[1]);
	var oldUnit = resArray[2];
	var inCelcius = toCelciusMap[oldUnit](value);
	return fromCelciusMap[newUnit](inCelcius);
};

module.exports = {
	mass: converter(gramMap, 'mass'),
	volume: converter(literMap, 'volume'),
	pressure: converter(pascalMap, 'pressure'),
	time: converter(timeMap, 'time'),
	temperature: temperatureConverter
}