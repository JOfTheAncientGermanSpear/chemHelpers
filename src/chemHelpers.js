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

    var fnMap = {
        P: idealGasPressure,
        V: idealGasVolume,
        n: idealGasMoles,
        T: idealGasTemp
    };

	var missingParamFn = utils.getFunctionForMissingParam(fnMap, knownParams);

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


var freezingPointDepressionKf = function(params){
    return -1 * params.dTf/params.m;
};

var freezingPointDepressionMolality = function(params){
    return -1 * params.Tf / params.Kf
};

var freezingPointDepressionTf = function(params){
    return -1 * params.Kf * params.m;
};

var freezingPointDepression = function(knownParams){

    var fnMap = {
        Kf: freezingPointDepressionKf,
        m: freezingPointDepressionMolality,
        Tf: freezingPointDepressionTf
    };

    var missingParamFn = utils.getFunctionForMissingParam(fnMap, knownParams);

    return missingParamFn();
};

var molalityToPercentMass = function(molecule, molality){
	var Mm = molarMass(molecule);
	var mass = molality * Mm;
	var massSolution = 1000 + mass;
	return mass/massSolution * 100;
};

var percentMassToMolality = function(molecule, percentMass, solutionDensity){
	//assume solution volume is 1 L
	solutionDensity = solutionDensity ? solutionDensity : 1;
	var solutionMassKg = solutionDensity;
	var mass = percentMass/100 * solutionMassKg * 1000;
	var Mm = molarMass(molecule);
	var moles = mass/Mm;
	var solventMassKg = solutionMassKg - mass/1000;
	return moles/solventMassKg;
};

var molalityToMolarity = function(molecule, m, solutionDensity){
	var solventMassKg = 1;
	var moles = m;
	solutionDensity = solutionDensity ? solutionDensity : 1;
	var soluteMass = moles * molarMass(molecule);
	var solutionMassKg = solventMassKg + soluteMass/1000;
	var solutionVolume = solutionMassKg / solutionDensity;
	return moles/solutionVolume;
};

var molarityToMolality = function(molecule, M, solutionDensity){
	var moles = M;
	var mass = moles * molarMass(molecule);
	var solutionMass = solutionDensity ? solutionDensity : 1;
	var solventMassKg = solutionMass - mass/1000;
	return moles/solventMassKg;
};

var percentMass = function(params){
	var solutionMass = params.solutionMass ? params.solutionMass :
		params.solventMass + params.soluteMass;
	return params.soluteMass / solutionMass * 100;
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
    atomCharges: atomCharges,
    freezingPointDepression: freezingPointDepression,
    molalityToPercentMass: molalityToPercentMass,
    percentMass: percentMass,
    percentMassToMolality: percentMassToMolality,
    molarityToMolality: molarityToMolality,
    molalityToMolarity: molalityToMolarity
};
