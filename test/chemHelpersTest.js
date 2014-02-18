var assert = require("assert");

var chemHelpers = require("../src/chemHelpers.js")

describe('Chem Helpers', function(){
    describe('molar mass', function(){
        it('should give 31.9988 for O2', function(){
            assert.equal(31.9988, chemHelpers.molarMass('O2'));
        })
    })
});
