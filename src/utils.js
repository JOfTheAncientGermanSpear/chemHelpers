var _ = require("underscore");

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

    var argArray = _.toArray(arguments);

    var symbols = _.filter(argArray, isEven);

    var coefficients = _.filter(argArray, isOdd);

    return _.object(symbols, coefficients);
};

var splitConcat = function(array1, array2) {
    function concat(a) { return array1.concat(a); }
    return _.map(array2, concat);
};

var addDimension = function(dimensions, newDimension){
    return flatMap(dimensions, function(d){
        return splitConcat(d, newDimension);
    });
};

var flatMap = function(array, fn, depth) {
    return _.flatten(_.map(array, fn), depth ? depth : 1);
};

var calculateUnknownParam = function(fnMap, params){
    function curryKnownParams(fn){
        return _.partial(fn, params);
    }

    var unknownParam = _.chain(fnMap).
        keys().
        difference(_.keys(params)).
        first().
        value();

    var res = {};
    res[unknownParam] = curryKnownParams(fnMap[unknownParam])();
    
    return res;
};

var mapToFunction = function(map){
    return function(input){
        return map[input];
    };
};

var negater = function(fn){
    return function(params){
        return -1 * fn(params);
    };
};

var multiplier = function(/*keys*/){
    var keys = _.toArray(arguments);
    return function(inputObj){
        var accumulator = function(acc, key){
            return acc * (_.isNumber(key) ? key : inputObj[key]);
        };
        return inputObj ?
            _.reduce(keys,
                accumulator, 
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

var unitAppender = function(unit){
    return function(value){
        return value + unit;
    };
};

var paramConverter = function(param, converterFn, newUnit){
    return function(params){
        var newParams = _.extend({}, params);
        var oldValue = params[param];
        newParams[param] = converterFn(oldValue, newUnit);
        return newParams;
    };
};

var chainFunctions = function(/*functions*/){
    var functions = _.toArray(arguments).reverse();
    return _.compose.apply(null, functions);
};

module.exports = {
    stringToElements: stringToElements,
    splitConcat: splitConcat,
    symsAndCoeffsMap: symsAndCoeffsMap,
    flatMap: flatMap,
    addDimension: addDimension,
    calculateUnknownParam: calculateUnknownParam,
    mapToFunction: mapToFunction,
    multiplier: multiplier,
    divider: divider,
    negater: negater,
    unitAppender: unitAppender,
    paramConverter: paramConverter,
    chainFunctions: chainFunctions
};
