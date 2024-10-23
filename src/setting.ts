import { App, PluginSettingTab, Setting } from 'obsidian';
import locale from 'src/lang';
import AnkiSynchronizer from 'main';

// Plugin Settings
export interface Settings {
  linkify: boolean;
  showSyncIcon: boolean;
  showImportIcon: boolean;
  autoSync: number;
}


export const DEFAULT_SETTINGS: Settings = {
  linkify: true,
  showImportIcon: true,
  showSyncIcon: true,
  autoSync: 0,
};

export default class AnkiSynchronizerSettingTab extends PluginSettingTab {
  plugin: AnkiSynchronizer;

  constructor(app: App, plugin: AnkiSynchronizer) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();
    this.containerEl.createEl('h2', { text: locale.settingTabHeader });

    new Setting(this.containerEl)
      .setName(locale.settingLinkifyName)
      .setDesc(locale.settingLinkifyDescription)
      .addToggle(v =>
        v.setValue(this.plugin.settings.linkify).onChange(async value => {
          this.plugin.settings.linkify = value;
          await this.plugin.save()
        })
      );


    new Setting(this.containerEl)
      .setName(locale.settingRubberIconImportName)
      .setDesc(locale.settingRubberIconImportDescription)
      .addToggle(v =>
        v.setValue(this.plugin.settings.showImportIcon).onChange(async value => {
          this.plugin.settings.showImportIcon = value;
          await this.plugin.save()
        })
      );

    new Setting(this.containerEl)
      .setName(locale.settingRubberIconSyncName)
      .setDesc(locale.settingRubberIconSyncDescription)
      .addToggle(v =>
        v.setValue(this.plugin.settings.showSyncIcon).onChange(async value => {
          this.plugin.settings.showSyncIcon = value;
          await this.plugin.save()
        })
      );

    new Setting(this.containerEl)
      .setName(locale.settingTimerName)
      .setDesc(locale.settingTimerDescription)
      .addText(v =>
        v.setValue(this.plugin.settings.autoSync.toString()).onChange(async value => {
          const parsed = parseInt(value.trim())
          if (!isNaN(parsed)) {
            this.plugin.settings.autoSync = parsed;
          } else {
            this.plugin.settings.autoSync = 0;
            value = '0';
          }
          this.plugin.startNewInterval()
          await this.plugin.save()
        })
      )

  }
}
