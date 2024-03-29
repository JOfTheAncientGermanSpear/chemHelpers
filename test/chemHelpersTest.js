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
            assert.equal(chemHelpers.idealGasLaw(params).P, chemHelpers.idealGasPressure(params));
        });
        it('should give same result as ideal gas volume if V not specified', function(){
            var params = {n: 2, T: "290 K", P: "1.2 atm"};
            assert.equal(chemHelpers.idealGasLaw(params).V, chemHelpers.idealGasVolume(params));
        })
    });
    describe('molaltiy', function(){
        it('should calculate molality by mass over n', function(){
            var q = {mass: "10 kg", n: 2};
            assert.equal(.2, chemHelpers.molality(q).m);
        });
    });
});
