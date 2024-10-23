import { stringifyYaml, FrontMatterCache, TFile, EmbedCache } from "obsidian";
import { NoteDigest, NoteTypeDigest } from "./state";
import { MD5 } from "object-hash";
import { Settings } from "./setting";

const PICTURE_EXTENSION = ["png", "jpg", "jpeg", "gif", "bmp", "svg"];
const VIDEO_EXTENSION = ["mp3", "wav", "m4a", "ogg", "3gp", "flac", "mp4", "ogv", "mov", "mkv", "webm"];

export interface MediaNameMap {
  obsidian: string;
  anki: string;
}

export interface FrontMatter {
  mid: number;
  nid: number;
  tags: string[];
}

export default class Note {
  basename: string;
  folder: string;
  nid: number;
  mid: number;
  content: string;
  tags: string[];
  fields: Record<string, string>;
  typeName: string;
  extras: object;
  hash: string;

  constructor(
    basename: string,
    folder: string,
    typeName: string,
    content: string,
    frontMatter: FrontMatter,
    fields: Record<string, string>,
    hash: string
  ) {
    this.basename = basename;
    this.folder = folder;
    const { mid, nid, tags, ...extras } = frontMatter;
    this.typeName = typeName;
    this.mid = mid;
    this.content = content;
    this.nid = nid;
    this.tags = tags ?? [];
    this.tags.push("obsidian sync");
    this.extras = extras;
    this.fields = fields;
    this.hash = hash;
  }

  digest(): NoteDigest {
    return {
      deck: this.folder,
      hash: this.hash
    };
  }

  toAnkiNote(vault: string) {
    return {
      deckName: this.folder,
      modelName: this.typeName,
      fields: this.format(vault),
      tags: this.tags
    };

  }

  title() {
    return this.basename;
  }

  public format(vaultName: string) {
    const fields = this.fields;
    const keys = Object.keys(fields);
    const result: Record<string, string> = {};
    keys.map((key, _) => {
      const markdown = convertWikilink(fields[key], vaultName);
      result[key] = markdown;
    });
    return result;
  }

}



export class NoteManager {
  private settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }


  genNoteDigest(
    file: TFile,
    content: string,
  ): NoteDigest {
    return {
      deck: renderDeckName(this.getFolder(file)),
      hash: this.genHash(file, content)
    };
  }

  genHash(
    file: TFile,
    content: string,
  ) {
    return MD5({ folder: this.getFolder(file), basename: this.getBaseName(file), content: content });
  }

  getFolder(file: TFile) {
    return file.parent.path == '/' ? '' : file.parent.path;
  }

  getBaseName(file: TFile) {
    return file.basename;
  }

  getNoteBody(content: string) {
    const lines = content.split("\n");
    const yamlEndIndex = lines.indexOf("---", 1);
    return lines.slice(yamlEndIndex + 1);
  }

  createValidateNote(
    file: TFile,
    frontmatter: FrontMatterCache,
    content: string,
    media: EmbedCache[] | undefined,
    noteTypes: Map<number, NoteTypeDigest>
  ): [Note, MediaNameMap[] | undefined] {
    if (
      !frontmatter.hasOwnProperty('mid') ||
      !frontmatter.hasOwnProperty('nid') ||
      !frontmatter.hasOwnProperty('tags')
    ) {
      throw new Error(`Invalid frontmatter in ${file.basename}`);
    }

    const basename = this.getBaseName(file)
    const folder = renderDeckName(this.getFolder(file));
    const frontMatter = Object.assign({}, frontmatter, { position: undefined }) as FrontMatter;
    const noteType = noteTypes.get(frontMatter.mid);
    const body = this.getNoteBody(content);

    if (!noteType) {
      throw new Error(`Invalid note type in ${basename}`);
    }
    const [fields, mediaNameMap] = this.parseFields(basename, noteType, body, media, frontmatter.header);
    if (!fields) {
      throw new Error(`Invalid fields in ${basename}`);
    }

    return [new Note(basename, folder, noteType.name, content, frontMatter, fields, this.genHash(file, content)), mediaNameMap];
  }

  chooseHeader(title: string, header: string | undefined): string[] {
    if (this.settings.linkify)
      title = `[[${title}]]`;
    if (header != undefined)
      return [header + '\n\n' + title]
    return [title]
  }

  parseFields(
    title: string,
    noteType: NoteTypeDigest,
    body: string[],
    media: EmbedCache[] | undefined,
    header: string | undefined
  ): [Record<string, string> | undefined, MediaNameMap[] | undefined] {
    const fieldNames = noteType.fieldNames;
    const fieldContents: string[] = this.chooseHeader(title, header)
    const mediaNameMap: MediaNameMap[] = [];
    let buffer: string[] = [];
    let mediaCount = 0;
    for (const line of body) {
      if (
        media &&
        mediaCount < media.length &&
        line.includes(media[mediaCount].original) &&
        this.validateMedia(media[mediaCount].link)
      ) {
        let mediaName = line.replace(
          media[mediaCount].original,
          media[mediaCount].link.split('/').pop() as string
        );
        if (this.isPicture(mediaName)) mediaName = '<img src="' + mediaName + '">';
        else mediaName = '[sound:' + mediaName + ']';
        if (!mediaNameMap.map(d => d.obsidian).includes(media[mediaCount].original)) {
          mediaNameMap.push({ obsidian: media[mediaCount].original, anki: mediaName });
          mediaCount++;
          buffer.push(mediaName);
        }
      } else {
        buffer.push(line);
      }
    }
    fieldContents.push(buffer.join('\n'));
    if (fieldNames.length !== fieldContents.length) return [undefined, undefined];
    const fields: Record<string, string> = {};
    fieldNames.map((v, i) => (fields[v] = fieldContents[i]));
    return [fields, mediaNameMap];
  }

  validateMedia(mediaName: string) {
    return [...PICTURE_EXTENSION, ...VIDEO_EXTENSION].includes(
      mediaName.split('.').pop() as string
    );
  }

  isPicture(mediaName: string) {
    return PICTURE_EXTENSION.includes(mediaName.split('.').pop() as string);
  }

  dump(note: Note) {
    const frontMatter = stringifyYaml(
      Object.assign(
        {
          mid: note.mid,
          nid: note.nid,
          tags: note.tags
        },
        note.extras
      )
    ).trim().replace(/"/g, ``);
    const lines = [`---`, frontMatter, `---` ];
    try{
      lines.concat(this.getNoteBody(note.content));
    }catch(e){}
    return lines.join('\n');
  }
}


///utils 


function convertWikilink(markup: string, vaultName: string) {
  return markup.replace(/!?\[\[(.+?)\]\]/g, (_, basename) => {
    let title = basename;
    if (basename.includes('|')) {
      const split = basename.split('|');
      basename = split[0];
      title = split[1];
    }
    const url = `obsidian://open?vault=${encodeURIComponent(
      vaultName
    )}&file=${encodeURIComponent(basename)}`;
    // wikilinks if there is a [[page|title]] report only the title
    return `[${title}](${url})`;
  });
}
function renderDeckName(folder: string) {
  return folder.replace(/\//g, "::") || "Obsidian";
}