var assert = require("assert");

var chemHelpers = require("../src/chemHelpers.js")

describe('Chem Helpers', function(){
    describe('molar mass', function(){
        it('should give 31.9988 for O2', function(){
            assert.equal(31.9988, chemHelpers.molarMass('O2'));
        })
    });
    describe('ideal gas law', function(){
        it('should give same result as ideal gas pressure if P not specified', function(){
            var params = {n: 2, T: "290K", V: "2 L"};
            assert.equal(chemHelpers.idealGasLaw(params).result, chemHelpers.idealGasPressure(params));
            assert.equal(chemHelpers.idealGasLaw(params).calculated_for, "P");
        });
        it('should give same result as ideal gas volume if V not specified', function(){
            var params = {n: 2, T: "290 K", P: "1.2 atm"};
            assert.equal(chemHelpers.idealGasLaw(params).result, chemHelpers.idealGasVolume(params));
            assert.equal(chemHelpers.idealGasLaw(params).calculated_for, "V");
        })
    })
});
