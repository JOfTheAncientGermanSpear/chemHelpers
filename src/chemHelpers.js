var _ = require("underscore");

var pTable = require("./elements.json");

var utils = require("./utils.js");

var kbMap = require('./kbMap.json');

var solubilityChart = require("./solubilityChart.json");

var unitConverters = require("./unitConverters.js");

var elements = _.reduce(pTable, function(acc, elem){
  acc[elem.symbol] = elem;
  return acc;
}, {});

var molarMass = function(molecularFormula){

  var compound = utils.stringToElements(molecularFormula);

  var addElemMass = function(acc, elemCoefficient, elemSym) {
  	var elemMass = elements[elemSym].atomic_weight;
  	return acc + elemMass * elemCoefficient;
  };

  return _.reduce(compound, addElemMass, 0);
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

	var percentCompositions = _.reduce(compound, appendElemInfo, {});
	percentCompositions.totalMass = compoundMass;
	
	return percentCompositions;
};


var empiricalFormula = function(){
	var argsArray = _.toArray(arguments);
	var massPercents = utils.symsAndCoeffsMap.apply(null, argsArray);

	var coeffs = _.reduce(massPercents, function(acc, percent, elemSym){
		var mass = molarMass(elemSym + 1);
		acc[elemSym] = percent/mass;
		return acc;
	}, {});

	var minimumCoeff = _.min(coeffs);

	return _.reduce(coeffs, function(acc, coeff, elemSym) {
		acc[elemSym] = coeff / minimumCoeff;
		return acc;
	}, {});

};

var R = 0.08206;//(L atm)/(K mol)

//PV = nRT
var idealGasPressure = utils.chainFunctions(
	utils.paramConverter('T', unitConverters.temperature, 'K'),
	utils.paramConverter('V', unitConverters.volume, 'L'),
	utils.divider(['n', R, 'T'], ['V']),
	utils.unitAppender('atm')
	);

//V = nRT/P
var idealGasVolume = utils.chainFunctions(
	utils.paramConverter('T', unitConverters.temperature, 'K'),
	utils.paramConverter('P', unitConverters.pressure, 'atm'),
	utils.divider(['n', R, 'T'], ['P']),
	utils.unitAppender('L')
	);

//n = PV/RT
var idealGasMoles = utils.chainFunctions(
	utils.paramConverter('T', unitConverters.temperature, 'K'),
	utils.paramConverter('P', unitConverters.pressure, 'atm'),
	utils.paramConverter('V', unitConverters.volume, 'L'),
	utils.divider(['P', 'V'], [R, 'T'])
	);

//T = PV/nR
var idealGasTemp = utils.chainFunctions(
	utils.paramConverter('P', unitConverters.pressure, 'atm'),
	utils.paramConverter('V', unitConverters.volume, 'L'),
	utils.divider(['P', 'V'], [R, 'n']),
	utils.unitAppender('K')
	);

var unknownCalculator = function(fnMap){
	return function(knownParams){
		return _.extend(knownParams, utils.calculateUnknownParam(fnMap, knownParams));
	};
};

var idealGasLawFnMap =  {
    P: idealGasPressure,
    V: idealGasVolume,
    n: idealGasMoles,
    T: idealGasTemp
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
        return _.map(strings, function(s){return parseInt(s);});
    }

    var compound = utils.stringToElements(molecularFormula);

    var possibleSolutions = _.reduce(compound, function(dimensions, elemCoefficient, elemSym){
        function appendElementInfo(charge){
            return { element: elemSym,
                charge: charge,
                chargeMultiplier: elemCoefficient }
        }
        var element = elements[elemSym];
        var elementCharges = stringToCharges(element.oxidation_states);
        var newDimension = _.map(elementCharges, appendElementInfo);
        return utils.addDimension(dimensions, newDimension);
    }, [[]]);

    var isSolution = function(possibleSolution){
        var solutionCharge = _.reduce(possibleSolution, function(acc, elem){
            return acc + elem.charge * elem.chargeMultiplier;
        }, 0);
        return solutionCharge == moleculeCharge;
    };

    return _.filter(possibleSolutions, isSolution);
};

var toC = _.bind(unitConverters.temperature, _, 'C');

var freezingPointDepression_Kf = utils.chainFunctions(
	utils.paramConverter('dTf', unitConverters.temperatureDiff, 'C'),
	utils.divider([-1, 'dTf'], ['m'])
	);

var freezingPointDepression_m = utils.chainFunctions(
	utils.paramConverter('dTf', unitConverters.temperatureDiff, 'C'),
	utils.divider([-1, 'dTf'], ['Kf'])
	);

var freezingPointDepression_dTf = utils.chainFunctions(
	utils.multiplier(-1, 'Kf', 'm'),
	utils.unitAppender('C'));

var freezingPointDepressionFnMap = {
    Kf: freezingPointDepression_Kf,
    m: freezingPointDepression_m,
    dTf: freezingPointDepression_dTf
};

var boilingPointElevation_Kb = utils.chainFunctions(
	utils.paramConverter('dTb', unitConverters.temperatureDiff, 'C'),
	utils.divider(['dTb'], ['m'])
	);

var boilingPointElevation_m = utils.chainFunctions(
	utils.paramConverter('dTb', unitConverters.temperatureDiff, 'C'),
	utils.divider(['dTb'], ['Kb'])
	);

var boilingPointElevation_dTb = utils.chainFunctions(
	utils.multiplier('Kb', 'm'),
	utils.unitAppender('C'));

var boilingPointElevationFnMap = {
	Kb: boilingPointElevation_Kb,
	m: boilingPointElevation_m,
	dTb: boilingPointElevation_dTb
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
	var soluteMass = params.soluteMass ? params.soluteMass :
		chemHelpers.molarMass(params.soluteMolecule) * params.soluteMoles;
	return soluteMass / solutionMass * 100;
};

var numberOfMoles = function(molecule, totalMass){
	return totalMass / molarMass(molecule);
};

//m = n/mass
var molality_n = utils.chainFunctions(
	utils.paramConverter('mass', unitConverters.mass, 'kg'),
	utils.multiplier('m', 'mass')
);

var molality_mass = utils.chainFunctions(
	utils.divider(['n'], ['m']),
	utils.unitAppender('kg')
);

var molality_m = utils.chainFunctions(
	utils.paramConverter('mass', unitConverters.mass, 'kg'),
	utils.divider(['n'], ['mass'])
);

var molalityFnMap = {
	n: molality_n,
	mass: molality_mass,
	m: molality_m
};

var moleFractionsFromMass = function(moleculeMassMap){
	var moleculeMoles = _.reduce(moleculeMassMap, 
		function(acc, mass, molecule){
			var numOfMoles = unitConverters.mass(mass, 'g') / molarMass(molecule);
			acc[molecule] = numOfMoles;
			return acc;
		}, {}
		);

	var totalMoles = _.reduce(moleculeMoles, function(acc, numOfMoles){
		return acc + numOfMoles;
	}, 0);

	return _.reduce(moleculeMoles, function(acc, numOfMoles, molecule){
		acc[molecule] = numOfMoles/totalMoles;
		return acc;
	}, {});
};

var percentError = function(theoretical, actual){
	return Math.abs(theoretical - actual)/actual * 100;
};

var densityFnMap = {
	m: utils.multiplier('d', 'V'),
	V: utils.divider(['m'],['d']),
	d: utils.divider(['m'],['V'])
};

var dissolve = function(params){
	var initialConcentration = params.initialConcentration;
	var originalVolume = params.originalVolume;
	var newVolume = params.newVolume ? params.newVolume : params.addedVolume + params.originalVolume;
	return initialConcentration * originalVolume / newVolume;
};

module.exports = {
	molarMass: molarMass,
	percentComposition: percentComposition,
	empiricalFormula: empiricalFormula,
	idealGasLaw: unknownCalculator(idealGasLawFnMap),
	idealGasPressure: idealGasPressure,
	idealGasVolume: idealGasVolume,
	idealGasMoles: idealGasMoles,
	idealGasTemp: idealGasTemp,
	unitConversions: unitConversions,
	mercuryHeightToAtm: mercuryHeightToAtm,
    solubilityLookup: solubilityLookup,
    atomCharges: atomCharges,
    freezingPointDepression: unknownCalculator(freezingPointDepressionFnMap),
    molalityToPercentMass: molalityToPercentMass,
    percentMass: percentMass,
    percentMassToMolality: percentMassToMolality,
    molarityToMolality: molarityToMolality,
    molalityToMolarity: molalityToMolarity,
    moleFractionsFromMass: moleFractionsFromMass,
    percentError: percentError,
    elements: utils.mapToFunction(elements),
    dissolve: dissolve,
    numberOfMoles: numberOfMoles,
    boilingPointElevation: unknownCalculator(boilingPointElevationFnMap),
    kbMap: kbMap,
    density: unknownCalculator(densityFnMap),
    molality: unknownCalculator(molalityFnMap)
};
