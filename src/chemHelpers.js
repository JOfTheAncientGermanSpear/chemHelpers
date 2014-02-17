var und = require("underscore");

var pTable = require("./elements.json");

var solubilityChart = require("./solubilityChart.json");

var elements = und.reduce(pTable, function(acc, elem){
  acc[elem.symbol] = elem;
  return acc;
}, {});

var stringToElements = function(string){

    var elementRegex = /^[A-Z](?:(?![A-Z]).)*/;

    var nameRegex = /[A-z]+/;
    var coefficientRegex = /[0-9]+/;

    var elementInfo = string.match(elementRegex);
    if(elementInfo) {
        var elementName = elementInfo[0].match(nameRegex)[0];

        var elementCoefficientInfo = elementInfo[0].match(coefficientRegex);
        var elementCoefficient = elementCoefficientInfo ? parseInt(elementCoefficientInfo[0]) : 1;

        var otherElements = string.substring(elementInfo[0].length);

        var state = stringToElements(otherElements);

        state[elementName] =  state[elementName] ? state[elementName] + elementCoefficient : elementCoefficient;

        return state;
    }
    else return {};

};

var symsAndCoeffsMap = function(){
  function isEven(e, ix){
    return ix % 2 == 0;
  }

  function isOdd(e, ix){
    return ix % 2 != 0;
  }

  var argArray = und.toArray(arguments);
  
  var symbols = und.filter(argArray, isEven);
  
  var coefficients = und.filter(argArray, isOdd);

  return und.object(symbols, coefficients);
};

var molarMass = function(molecularFormula){

  var compound = stringToElements(molecularFormula);

  var addElemMass = function(acc, elemCoefficient, elemSym) {
  	var elemMass = elements[elemSym].atomic_weight;
  	return acc + elemMass * elemCoefficient;
  };

  return und.reduce(compound, addElemMass, 0);
};

var percentComposition = function(molecularFormula) {

	var compound = stringToElements(molecularFormula);

	var compoundMass = molarMass(molecularFormula);

	var appendElemInfo = function(acc, elemCoeff, elemSym) {
		var mass = molarMass(elemSym + elemCoeff);
		var percent = mass / compoundMass * 100;
		
		acc[elemSym] = {
			atomic_mass: elements[elemSym].atomic_weight,
			mass: mass,
			percent: percent,
			coefficient: elemCoeff
		};
		
		return acc;
	};

	var percentCompositions = und.reduce(compound, appendElemInfo, {});
	percentCompositions.totalMass = compoundMass;
	
	return percentCompositions;
};


var empiricalFormula = function(){
	var argsArray = und.toArray(arguments);
	var massPercents = symsAndCoeffsMap.apply(null, argsArray);

	var coeffs = und.reduce(massPercents, function(acc, percent, elemSym){
		var mass = molarMass(elemSym, 1);
		acc[elemSym] = percent/mass;
		return acc;
	}, {});

	var minimumCoeff = und.min(coeffs);

	return und.reduce(coeffs, function(acc, coeff, elemSym) {
		acc[elemSym] = coeff / minimumCoeff;
		return acc;
	}, {});

};

var R = 0.08206;//(L atm)/(K mol)

//PV = nRT
var idealGasPressure = function(params) {
	//P = nRT/V
	return  params.n * R * params.T /params.V;
};

var idealGasVolume = function(params){
	//V = nRT/P
    //var paramsHave = und.bind(und.has, params);
    //if(paramsHave("n") && paramsHave("T") && paramsHave("P"))
	return  params.n * R * params.T/params.P;
};

var idealGasMoles = function(params) {
	//n = PV/RT
	return  params.P * params.V / (R * params.T);
};

var idealGasTemp = function(params) {
	//T = PV/nR
	return params.P * params.V/ (R * params.n);
};

var idealGasLaw = function(knownParams){

	function getFnForUnknownParam(){

        function curryKnownParams(fn){
            return und.partial(fn, knownParams);
        }

		var fnMap = {
			P: idealGasPressure,
			V: idealGasVolume,
			n: idealGasMoles,
			T: idealGasTemp
		};

        var isKnownParam = curryKnownParams(und.has);

		var unknownParam = und.chain(["P", "V", "n", "T"]).
            reject(isKnownParam).
            first().
            value();

		return curryKnownParams(fnMap[unknownParam]);

	}

	var missingParamFn = getFnForUnknownParam();

	return missingParamFn();
};

var unitConversions = 
{
	atm: {
		mmHg: 760,
		pascal: 101325,
		torr: 0.001315789473684
	}
};

var mercuryHeightToAtm = function(height){
	var density = 13595.1;
	var gravity = 9.80665;
	var p = density * height * gravity;
	return p/unitConversions.atm.pascal;
};

var solubilityLookup = function(catIon, anIon) {
    return solubilityChart[catIon][anIon];
};

var atomCharges = function(molecularFormula, overallCharge){
    function stringToCharges(string){
        var strings = string.split(",");
        return und.map(strings, function(s){return parseInt(s);});
    };

    var compound = stringToElements(molecularFormula);
    var charges = und.reduce(compound, function(acc, elem){
        acc[elem.symbol] = stringToCharges(elem.oxidation_states);
    }, {});

    return charges;
};

module.exports = {
	molarMass: molarMass,
	percentComposition: percentComposition,
	empiricalFormula: empiricalFormula,
	idealGasLaw: idealGasLaw,
	idealGasPressure: idealGasPressure,
	idealGasVolume: idealGasVolume,
	idealGasMoles: idealGasMoles,
	idealGasTemp: idealGasTemp,
	unitConversions: unitConversions,
	mercuryHeightToAtm: mercuryHeightToAtm,
    solubilityLookup: solubilityLookup,
    stringToElements: stringToElements
};
