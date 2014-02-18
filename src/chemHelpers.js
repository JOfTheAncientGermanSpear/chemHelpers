var und = require("underscore");

var pTable = require("./elements.json");

var utils = require("./utils.js");

var solubilityChart = require("./solubilityChart.json");

var elements = und.reduce(pTable, function(acc, elem){
  acc[elem.symbol] = elem;
  return acc;
}, {});

var molarMass = function(molecularFormula){

  var compound = utils.stringToElements(molecularFormula);

  var addElemMass = function(acc, elemCoefficient, elemSym) {
  	var elemMass = elements[elemSym].atomic_weight;
  	return acc + elemMass * elemCoefficient;
  };

  return und.reduce(compound, addElemMass, 0);
};

var percentComposition = function(molecularFormula) {

	var compound = utils.stringToElements(molecularFormula);

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
	var massPercents = utils.symsAndCoeffsMap.apply(null, argsArray);

	var coeffs = und.reduce(massPercents, function(acc, percent, elemSym){
		var mass = molarMass(elemSym + 1);
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

var atomCharges = function(molecularFormula, moleculeCharge){
    moleculeCharge = moleculeCharge ? moleculeCharge : 1;

    function stringToCharges(string){
        var strings = string.split(",");
        return und.map(strings, function(s){return parseInt(s);});
    }

    var compound = utils.stringToElements(molecularFormula);

    var possibleSolutions = und.reduce(compound, function(dimensions, elemCoefficient, elemSym){
        function appendElementInfo(charge){
            return { element: elemSym,
                charge: charge,
                chargeMultiplier: elemCoefficient }
        }
        var element = elements[elemSym];
        var elementCharges = stringToCharges(element.oxidation_states);
        var newDimension = und.map(elementCharges, appendElementInfo);
        return utils.addDimension(dimensions, newDimension);
    }, [[]]);

    var isSolution = function(possibleSolution){
        var solutionCharge = und.reduce(possibleSolution, function(acc, elem){
            return acc + elem.charge * elem.chargeMultiplier;
        }, 0);
        return solutionCharge == moleculeCharge;
    };

    return und.filter(possibleSolutions, isSolution);
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
    atomCharges: atomCharges
};
