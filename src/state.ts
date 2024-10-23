import AnkiSynchronizer from 'main';
import { Notice, TFile } from 'obsidian';
import Note, { FrontMatter } from 'src/note';
import Media from './media';
import Anki from './anki';
import locale from './lang';
import { MD5 } from 'object-hash';
import LoggerSync from './logger';

abstract class State<K, V> extends Map<K, V> {
  protected plugin: AnkiSynchronizer;
  protected anki: Anki;

  constructor(plugin: AnkiSynchronizer) {
    super();
    this.plugin = plugin;
    this.anki = plugin.anki;
  }

  async change(state: Map<K, V >) {
    for (const [key, value] of state.entries()) {
        let r = await this.update(key, value);
        if (r) {
          this.set(key, value);
        }
    }

    // delete all the keys not in the new state
    const _keys = [...this.keys()];
    const keys = [...state.keys()];
    for (const key of _keys.filter(x => !keys.includes(x))) {
      this.delete(key);
    }
  }

  abstract update(key: K, value: V): Promise<boolean>;
}

export type NoteTypeDigest = { name: string; fieldNames: string[] };

export class NoteTypeState extends State<number, NoteTypeDigest> {
  private templateFolderPath: string | undefined = undefined;

  setTemplatePath(templateFolderPath: string) {
    this.templateFolderPath = templateFolderPath;
  }

  delete(key: number) {
    const noteTypeDigest = this.get(key);
    if (noteTypeDigest !== undefined) {
      const templatePath = `${this.templateFolderPath}/${noteTypeDigest.name}.md`;
      const maybeTemplate = this.plugin.app.vault.getAbstractFileByPath(templatePath);
      if (maybeTemplate !== null) {
        this.plugin.app.vault.delete(maybeTemplate);
      }
    }
    return super.delete(key);
  }

  async update(key: number, value: NoteTypeDigest): Promise<boolean> {
    try {
      if (this.has(key)) {
        this.delete(key);
      }
      const pseudoFrontMatter = {
        mid: key,
        nid: 0,
        tags: [],
        date: '{{date}} {{time}}'
      } as FrontMatter;
      const pseudoFields: Record<string, string> = {};
      value.fieldNames.map(x => (pseudoFields[x] = '\n\n'));
      const templateNote = new Note(
        value.name,
        this.templateFolderPath!,
        value.name,
        "",
        pseudoFrontMatter,
        pseudoFields,
        MD5(pseudoFrontMatter)
      );
      const templatePath = `${this.templateFolderPath}/${value.name}.md`;
      const maybeTemplate = this.plugin.app.vault.getAbstractFileByPath(templatePath);
      if (maybeTemplate !== null) {
        await this.plugin.app.vault.modify(
          maybeTemplate as TFile,
          this.plugin.noteManager.dump(templateNote)
        );
      } else {
        await this.plugin.app.vault.create(templatePath, this.plugin.noteManager.dump(templateNote));
      }
      console.log(`Created template ${templatePath}`);
    } catch (e) {
      console.error(e)
      return false;
    }
    return true;
  }
}

export type NoteDigest = { deck: string, hash: string };

export class NoteState extends State<number, NoteDigest> {

  constructor(plugin: AnkiSynchronizer) {
    super(plugin);
  }

  // Existing notes may have 3 things to update: deck, fields, tags
  async update(key: number, val: NoteDigest ): Promise<boolean> {
      return true; 
  }


  delete(key: number) {
    let logger = LoggerSync.getInstance();
    logger.deleted.push(key.toString());
    this.plugin.anki.deleteNotes([key]);
    return super.delete(key);
  }

}
