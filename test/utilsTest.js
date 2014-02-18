var assert = require("assert");

var utils = require("../src/utils.js");

describe('Utils', function(){
    describe('string to elements', function(){
        it('should return {H: 2, O: 1} from "H2O"', function(){
            assert.equal(1, utils.stringToElements("H2O")['O']);
            assert.equal(2, utils.stringToElements("H2O")['H']);
        })
    })
});