import { FULL_LAMBDA_RUNTIME } from './environment.test';

const mockEpsagonLabel = jest.fn();
jest.mock('epsagon', () => {
  return {
    __esModule: true,
    default: {},
    label: mockEpsagonLabel
  };
});

const mockIOPipeLabel = jest.fn();
const mockIOPipeMetric = jest.fn();
jest.mock('@iopipe/iopipe', () => {
  return {
    __esModule: true,
    default: {},
    label: mockIOPipeLabel,
    metric: mockIOPipeMetric
  };
});

describe('Tagging with libs', () => {
  const ORIGINAL_ENVS = process.env;
  const commonProps = { LAMBDA_WRAPPER_LOG: 'true' };

  beforeEach(() => {
    jest.resetModules();
    console.log = jest.fn();
  });

  it('Only tag the keys and values', () => {
    process.env = { ...ORIGINAL_ENVS, ...commonProps, ...FULL_LAMBDA_RUNTIME };
    const { tagger } = require('./tagger');
    tagger.tagOnly('stage', 'stage');

    expect(mockEpsagonLabel).toHaveBeenCalledWith('stage');
    expect(mockIOPipeMetric).toHaveBeenCalledWith('stage', 'stage');
  });

  it('Only tag the keys', () => {
    process.env = { ...ORIGINAL_ENVS, ...commonProps, ...FULL_LAMBDA_RUNTIME };
    const { tagger } = require('./tagger');
    tagger.tagOnly('stage');

    expect(mockEpsagonLabel).toHaveBeenCalledWith('stage');
    expect(mockIOPipeLabel).toHaveBeenCalledWith('stage');
  });

  it('Tag and log with keys and values', () => {
    process.env = { ...ORIGINAL_ENVS, ...commonProps, ...FULL_LAMBDA_RUNTIME };
    const { tagger } = require('./tagger');
    tagger.tagAndLog('stage', 'stage');

    expect(mockEpsagonLabel).toHaveBeenCalledWith('stage');
    expect(mockIOPipeMetric).toHaveBeenCalledWith('stage', 'stage');
    expect(console.log).toHaveBeenCalledWith('stage', 'stage');
  });

  it('Tag and log with keys only', () => {
    process.env = { ...ORIGINAL_ENVS, ...commonProps, ...FULL_LAMBDA_RUNTIME };
    const { tagger } = require('./tagger');
    tagger.tagAndLog('stage');

    expect(mockEpsagonLabel).toHaveBeenCalledWith('stage');
    expect(mockIOPipeLabel).toHaveBeenCalledWith('stage');
    expect(console.log).toHaveBeenCalledWith('stage');
  });

  it('Handles missing Epsagon', () => {
    const mockMissingEpsagonLabel = jest.fn();
    jest.mock('epsagon', () => {
      return {
        __esModule: true,
        default: (function() {
          throw new Error();
        })(),
        label: mockMissingEpsagonLabel
      };
    });
    process.env = { ...ORIGINAL_ENVS, ...commonProps, ...FULL_LAMBDA_RUNTIME };
    const { tagger } = require('./tagger');
    tagger.tagAndLog('stage', 'stage');

    expect(mockMissingEpsagonLabel).not.toHaveBeenCalled();
    expect(mockIOPipeMetric).toHaveBeenCalledWith('stage', 'stage');
    expect(console.log).toHaveBeenCalledWith('stage', 'stage');
  });

  it('Handles missing IOPipe', () => {
    const mockMissingIOPipeLabel = jest.fn();
    const mockMissingIOPipeMetric = jest.fn();
    jest.mock('@iopipe/iopipe', () => {
      return {
        __esModule: true,
        default: (function() {
          throw new Error();
        })(),
        label: mockMissingIOPipeLabel,
        metric: mockMissingIOPipeMetric
      };
    });
    process.env = { ...ORIGINAL_ENVS, ...commonProps, ...FULL_LAMBDA_RUNTIME };
    const { tagger } = require('./tagger');
    tagger.tagAndLog('stage', 'stage');

    expect(mockEpsagonLabel).toHaveBeenCalledWith('stage');
    expect(mockMissingIOPipeLabel).not.toHaveBeenCalled();
    expect(mockMissingIOPipeMetric).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('stage', 'stage');
  });
});
