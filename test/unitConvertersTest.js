var assert = require('assert');

var unitConverters = require('../src/unitConverters.js');

describe('Unit Converters', function(){
	describe('mass', function(){
		it('should convert 1 kg to 1000 g', function(){
			assert.equal(1000, unitConverters.mass("1 kg", "g"));
		});
		it('should convert 1 kg to 100 dag', function(){
			assert.equal(100, unitConverters.mass("1 kg", "dag"));
		});
		it('should convert 1 lb to 453.5923 g', function(){
			assert.equal(453.5923, unitConverters.mass("1 lb", "g"));
		});
	});
	describe('temperature', function(){
		it('should convert C to f', function(){
			assert.equal(212, unitConverters.temperature("100 C", "f"));
		});
	});
	describe('temperature diff', function(){
		it('should convert C to 9/5 * f', function(){
			assert.equal(180, unitConverters.temperatureDiff("100 C", "f"));
		});
	});
});