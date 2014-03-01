var und = require("underscore");

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

var splitConcat = function(array1, array2) {
    function concat(a) { return array1.concat(a); }
    return und.map(array2, concat);
};

var addDimension = function(dimensions, newDimension){
    return flatMap(dimensions, function(d){
        return splitConcat(d, newDimension);
    });
};

var flatMap = function(array, fn, depth) {
    return und.flatten(und.map(array, fn), depth ? depth : 1);
};

var getFunctionForMissingParam = function(fnMap, params){
    function curryKnownParams(fn){
        return und.partial(fn, params);
    }

    var unknownParam = und.chain(fnMap).
        keys().
        difference(und.keys(params)).
        first().
        value();

    return function(){
        return {
            calculated_for: unknownParam,
            result: curryKnownParams(fnMap[unknownParam])()
        };
    }
};

var mapToFunction = function(map){
    return function(input){
        return map[input];
    };
};

var negate = function(fn){
    return function(params){
        return -1 * fn.apply(null, params);
    };
};

var multiplier = function(/*keys*/){
    var keys = und.toArray(arguments);
    return function(inputObj){
        return inputObj ?
            und.reduce(keys,
                function(acc, key){ return acc * inputObj[key];}, 
                1)
            : undefined;
    }
};

var divider = function(nums, denoms){
    var numMutliplier = multiplier.apply(null, nums);
    var denomMultiplier = multiplier.apply(null, denoms);

    return function(inputObj){
        return numMutliplier(inputObj) / denomMultiplier(inputObj);
    };
};

module.exports = {
    stringToElements: stringToElements,
    splitConcat: splitConcat,
    symsAndCoeffsMap: symsAndCoeffsMap,
    flatMap: flatMap,
    addDimension: addDimension,
    getFunctionForMissingParam: getFunctionForMissingParam,
    mapToFunction: mapToFunction,
    multiplier: multiplier,
    divider: divider
};
