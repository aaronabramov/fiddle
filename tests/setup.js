// Disable prompt to download react devtools in atom tests
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {isDisabled: true};

const { configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const { ElectronFiddleMock } = require('./mocks/electron-fiddle');
const { createSerializer } = require('enzyme-to-json');

configure({ adapter: new Adapter() });
expect.addSnapshotSerializer(createSerializer({mode: 'deep'}));

global.confirm = jest.fn();
global.fetch = require('jest-fetch-mock');

jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());
jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());

jest.mock('../src/constants', () => ({
  USER_DATA_PATH: '/Users/fake-user',
  INDEX_HTML_NAME: 'index.html',
  MAIN_JS_NAME: 'main.js',
  RENDERER_JS_NAME: 'renderer.js',
  PACKAGE_NAME: 'package.json',
  CONFIG_PATH: '~/.electron-fiddle'
}))

delete window.localStorage;
// We'll do this twice.
window.localStorage = {};
window.localStorage.setItem = jest.fn();
window.localStorage.getItem = jest.fn();

beforeEach(() => {
  global.ElectronFiddle = new ElectronFiddleMock();
  process.env.JEST = true;
  process.env.TEST = true;

  window.localStorage.setItem.mockReset();
  window.localStorage.getItem.mockReset();
});
