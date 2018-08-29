import { shallow } from 'enzyme';
import * as React from 'react';
const { shell } = require('electron');

import { AppearanceSettings } from '../../../src/renderer/components/settings-general-appearance';

jest.mock('fs-extra');
jest.mock('electron', () => require('../../../tests/mocks/electron'));
jest.mock('../../../src/utils/import', () => ({
  fancyImport: async (p: string) => require(p)
}));

jest.mock('../../../src/renderer/themes', () => ({
  THEMES_PATH: '~/.electron-fiddle/themes',
  getAvailableThemes: () => Promise.resolve([{
    name: 'defaultDark',
    file: 'defaultDark'
  }]),
  getTheme: () => Promise.resolve({
    common: {}
  })
}));

describe('AppearanceSettings component', () => {
  beforeEach(() => {
    this.store = {
      setTheme: jest.fn()
    };
  });

  it('renders', () => {
    const wrapper = shallow(
      <AppearanceSettings appState={this.store} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('handles a theme change', () => {
    const wrapper = shallow(
      <AppearanceSettings appState={this.store} />
    );
    const instance: AppearanceSettings = wrapper.instance() as any;
    instance.handleChange({
      target: {
        value: 'defaultLight'
      }
    } as any);

    expect(this.store.setTheme).toHaveBeenCalledWith('defaultLight');
  });

  describe('openThemeFolder()', () => {
    it('calls it on click', () => {
      const wrapper = shallow(
        <AppearanceSettings appState={this.store} />
      );
      const instance: AppearanceSettings = wrapper.instance() as any;
      instance.openThemeFolder = jest.fn();

      wrapper.find('#open-theme-folder').simulate('click');
      expect(instance.openThemeFolder).toHaveBeenCalled();
    });

    it('attempts to open the folder', async () => {
      const wrapper = shallow(
        <AppearanceSettings appState={this.store} />
      );
      const instance: AppearanceSettings = wrapper.instance() as any;
      await instance.openThemeFolder();

      expect(shell.showItemInFolder).toHaveBeenCalled();
    });

    it('handles an error', async () => {
      const wrapper = shallow(
        <AppearanceSettings appState={this.store} />
      );
      const instance: AppearanceSettings = wrapper.instance() as any;
      (shell as any).showItemInFolder.mockImplementationOnce(() => {
        throw new Error('Bwap');
      });

      expect(await instance.openThemeFolder()).toBe(false);
    });
  });

  describe('createNewThemeFromCurrent()', () => {
    it('calls it on click', () => {
      const wrapper = shallow(
        <AppearanceSettings appState={this.store} />
      );
      const instance: AppearanceSettings = wrapper.instance() as any;
      instance.createNewThemeFromCurrent = jest.fn();

      wrapper.find('#create-new-theme').simulate('click');
      expect(instance.createNewThemeFromCurrent).toHaveBeenCalled();
    });

    it('creates a new file from the current theme', async () => {
      const fs = require('fs-extra');
      const wrapper = shallow(
        <AppearanceSettings appState={this.store} />
      );
      const instance: AppearanceSettings = wrapper.instance() as any;
      await instance.createNewThemeFromCurrent();

      expect(shell.openItem).toHaveBeenCalled();
      expect(fs.outputJSON).toHaveBeenCalled();

      const args = fs.outputJSON.mock.calls[0];
      expect(args[0].includes(`.electron-fiddle`)).toBe(true);
      expect(args[1].name).toBeDefined();
      expect(args[1].name === 'defaultDark').toBe(false);
      expect(args[1].common).toBeDefined();
      expect(args[1].file).toBeUndefined();
    });

    it('handles an error', async () => {
      const fs = require('fs-extra');
      const wrapper = shallow(
        <AppearanceSettings appState={this.store} />
      );
      const instance: AppearanceSettings = wrapper.instance() as any;
      (shell as any).openItem.mockImplementationOnce(() => {
        throw new Error('Bwap');
      });

      const result = await instance.createNewThemeFromCurrent();
      expect(result).toBe(false);
    });
  });
});
