const epsagon = jest.genMockFromModule('epsagon');

// @ts-ignore
epsagon.label = function(key: string) {};

module.exports = epsagon;
