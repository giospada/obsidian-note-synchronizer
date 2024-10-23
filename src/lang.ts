import { moment } from 'obsidian';

interface Locale {
  onLoad: string;
  onUnload: string;
  synchronizeCommandName: string;
  fullSyncronize: string;
  templatesNotEnabledNotice: string;
  templatesFolderUndefinedNotice: string;
  importCommandName: string;
  importStartNotice: string;
  importSuccessNotice: string;
  importFailureNotice: string;
  synchronizeStartNotice: string;
  synchronizeSuccessNotice: string;
  synchronizeBadAnkiConnectNotice: string;
  synchronizeAnkiConnectUnavailableNotice: string;
  synchronizeAddNoteFailureNotice: (title: string) => string;
  synchronizeChangeDeckFailureNotice: (title: string) => string;
  synchronizeUpdateFieldsFailureNotice: (title: string) => string;
  synchronizeUpdateTagsFailureNotice: (title: string) => string;
  synchronizeAddDeckFailureNotice : (title: string) => string;
  settingTabHeader: string;
  settingLinkifyName: string;
  settingLinkifyDescription: string;
  settingRubberIconSyncName: string;
  settingRubberIconSyncDescription: string;
  settingRubberIconImportName: string;
  settingRubberIconImportDescription: string;
  settingTimerName: string;
  settingTimerDescription: string;
}

const en: Locale = {
  fullSyncronize: 'Full Sync Anki',
  onLoad: 'Note Synchronizer is successfully loaded!',
  onUnload: 'Note Synchronizer is successfully unloaded!',
  synchronizeCommandName: 'Synchronize',
  templatesNotEnabledNotice: 'Core plugin Templates is not enabled!',
  templatesFolderUndefinedNotice: 'Templates folder is undefined!',
  importCommandName: 'Import Note Types',
  importStartNotice: 'Importing note types from Anki...',
  importSuccessNotice: 'Successfully imported note types from Anki!',
  importFailureNotice: 'Cannot import note types from Anki!',
  synchronizeStartNotice: 'Synchronizing to Anki...',
  synchronizeSuccessNotice: 'Successfully synchronized to Anki!',
  synchronizeBadAnkiConnectNotice: `Bad version of AnkiConnect`,
  synchronizeAnkiConnectUnavailableNotice: `Anki is not opened or AnkiConnect is not installed!`,
  synchronizeAddNoteFailureNotice: (title: string) => `Cannot add note for ${title}`,
  synchronizeChangeDeckFailureNotice: (title: string) => `Cannot change deck for ${title}`,
  synchronizeUpdateFieldsFailureNotice: (title: string) => `Cannot update fields for ${title}`,
  synchronizeUpdateTagsFailureNotice: (title: string) => `Cannot update tags for ${title}`,
  synchronizeAddDeckFailureNotice : (title: string) => `Cannot add deck for ${title}`,
  settingTabHeader: 'Note Synchronizer Settings',
  settingLinkifyName: 'Linkify',
  settingLinkifyDescription: 'Whether to linkify the Obsidian title',
  settingRubberIconSyncName: 'Sync Icon',
  settingRubberIconSyncDescription: 'Toggle Sync Icon on the menu (the change will be visible after a reload)',
  settingRubberIconImportName: 'Import Icon',
  settingRubberIconImportDescription: 'Toggle Import Icon on the menu (the change will be visible after a reload)',
  settingTimerName: 'Auto Sync',
  settingTimerDescription: 'Set 0 to no set no auto sync, else set the number of minute to wait before the auto sync.',
};

const locales: { [k: string]: Partial<Locale> } = {
  en,
};

const locale: Locale = Object.assign({}, en, locales[moment.locale()]);

export default locale;
