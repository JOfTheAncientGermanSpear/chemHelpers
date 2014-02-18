var assert = require("assert");

var utils = require("../src/utils.js");

describe('Utils', function(){
    describe('string to elements', function(){
        it('should return {H: 2, O: 1} from "H2O"', function(){
            assert.equal(1, utils.stringToElements("H2O")['O']);
            assert.equal(2, utils.stringToElements("H2O")['H']);
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
        it('should return an array split into single element arrays when concatenated []', function(){
            var input = [1, 2, 3];
            var expected = [ [1], [2], [3] ];
            var actual = utils.splitConcat([], input);
            assert.deepEqual(expected, actual);
        })
    })
});