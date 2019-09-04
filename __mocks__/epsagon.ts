const epsagon = jest.genMockFromModule('epsagon');

// @ts-ignore
epsagon.label = function(key: string) {};

module.exports = epsagon;
// module.exports = (function() {
//   throw new Error();
// })();
