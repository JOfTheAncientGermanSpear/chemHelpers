var assert = require("assert");

var utils = require("../src/utils.js");

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
    describe('get function for unknown param', function(){
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
            var fn = utils.getFunctionForMissingParam(fnMap, params);
            assert.equal(expected, fn());
        })
    })
});