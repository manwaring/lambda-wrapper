const iopipe = jest.genMockFromModule('@iopipe/iopipe');

// @ts-ignore
iopipe.label = function(key: string) {};

// @ts-ignore
iopipe.metric = function(key: string, value: string) {};

module.exports = iopipe;
