var assert = require("assert");

var chemHelpers = require("../src/chemHelpers.js");

describe('Chem Helpers', function(){
    describe('string to elements', function(){
        it('should return {H: 2, O: 1} from "H2O"', function(){
            assert.equal(1, chemHelpers.stringToElements("H2O")['O']);
            assert.equal(2, chemHelpers.stringToElements("H2O")['H']);
        })
    })
});