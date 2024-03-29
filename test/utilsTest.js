var assert = require("assert");

var utils = require("../src/utils.js");

var unitConverters = require('../src/unitConverters.js');

describe('Utils', function(){
    describe('string to elements', function(){
        it('should return {H: 2, O: 1} from "H2O"', function(){
            assert.deepEqual({H: 2, O: 1}, utils.stringToElements("H2O"));
        })
    });
    describe('split concat', function(){
        it('should return an array of arrays with the concatenated array split and added', function(){
            var array1 = [1, 2, 3];
            var array2 = [3, 4];
            var expected = [ [1,2,3,3], [1,2,3,4] ];
            var actual = utils.splitConcat(array1, array2);
            assert.deepEqual(expected, actual);
        });
        it('should return an array split into single element arrays when concatenated against []', function(){
            var input = [1, 2, 3];
            var expected = [ [1], [2], [3] ];
            var actual = utils.splitConcat([], input);
            assert.deepEqual(expected, actual);
        })
    });
    describe('syms and coeffs map', function(){
        it('should create an object from two arrays, even as keys and odd as values', function(){
            var expected = {
                a: 1, b: 2
            };
            assert.deepEqual(expected, utils.symsAndCoeffsMap('a', 1, 'b', 2));
        })
    });
    describe('flat map', function(){
        it('should return a single array instead of array of arrays, even if mapping function returns an array', function(){
            var input = [1, 2, 3];
            var fn = function(e){
                return [e -1, e, e + 1];
            };
            var expected = [0, 1, 2, 1, 2, 3, 2, 3, 4];
            assert.deepEqual(expected, utils.flatMap(input, fn));
        })
    });
    describe('add dimension', function(){
        it('should return a matrix with columns for every new element', function(){
            var dimensions = [
                [1],
                [2]
            ];
            var newDimension = ['a', 'b'];
            var expected = [
                [1, 'a'],
                [1, 'b'],
                [2, 'a'],
                [2, 'b']
            ];
            var actual = utils.addDimension(dimensions, newDimension);
            assert.deepEqual(expected, actual);
        })
    });
    describe('calculate unknown param', function(){
        it('should return the function to calculate the unknown param', function(){
            var fnMap = {
                a: function(params){
                    return params.b * 2;
                },
                b: function(params) {
                    return params.a * 3;
                }
            };
            var params = {
                b: 3
            };
            var expected = 6;
            var result = utils.calculateUnknownParam(fnMap, params);
            assert.equal(expected, result.a);
        })
    });
    describe('multilpier', function(){
        it('should multiply labeled keys of an object', function(){
            var abMultipiler = utils.multiplier('a', 'b');
            var q = {a: 2, b: 3};
            assert.equal(6, abMultipiler(q));
        });
        it('should treat number inputs as constants', function(){
            var by2 = utils.multiplier('a', 2);
            var q = {a: 2};
            assert.equal(4, by2(q));
        });
    });
    describe('divider', function(){
        it('should divide numerator by denomenator', function(){
            var divider = utils.divider(['a', 'b'], ['c', 'd']);
            var q = {
                a: 3, b: 4,
                c: 2, d: 3
            };
            var expected = 2;
            assert.equal(expected, divider(q));
        });
        it('should treat number inputs as constants', function(){
            var by2 = utils.divider(['a'], [2]);
            var q = {a: 2};
            assert.equal(1, by2(q));
        });
    });
    describe('unit appender', function(){
        it('should append the unit to a value', function(){
            var expected = "2s";
            var append_s = utils.unitAppender("s");
            assert.equal(expected, append_s(2));
        });
    });
    describe('param converter', function(){
        it('should convert the specified key', function(){
            var input = {a: 2, b: "1 kg"};
            var expected = {a: 2, b: 1000};
            var paramConverter = utils.paramConverter('b', unitConverters.mass, 'g');
            assert.deepEqual(expected, paramConverter(input));
        });
    });
    describe('chain functions', function(){
        it('should execute a chain of functions', function(){
            var multiplyBy2 = function(a){return a * 2};
            var add3 = function(a){return a + 3};
            var expected = 9;
            var add3ThanMultiplyBy2 = utils.chainFunctions(multiplyBy2, add3);
            var actual = add3ThanMultiplyBy2(3);
            assert.equal(expected, actual);
        });
    });
    describe('param defaulters', function(){
        it('should give the default value to an object if not set', function(){
            var default_i_to_1 = utils.paramDefaulter('i', 1);
            var q = {a: 2};
            var expected = {a: 2, i: 1};
            var actual = default_i_to_1(q);
            assert.deepEqual(expected, actual);
        });
        it('should not overwrite a value that is specified', function(){
            var default_i_to_1 = utils.paramDefaulter('i', 1);
            var q = {a: 2, i: 3};
            assert.deepEqual(q, default_i_to_1(q));
        });
    });
});