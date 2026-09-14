import momentLib from "moment";

export const moment = momentLib;

/**
 * Standard Obsidian normalizePath simulation:
 * - Replaces backslashes with slashes
 * - Strips duplicate slashes
 * - Strips leading/trailing slashes and relative prefixes
 */
export function normalizePath(path: string): string {
  if (!path) return "";
  let p = path.replace(/\\/g, "/");
  p = p.replace(/\/+/g, "/");
  p = p.replace(/^\.\//, "");
  p = p.replace(/^\/+/, "");
  p = p.replace(/\/+$/, "");
  return p;
}

export class TAbstractFile {
  vault: any;
  path: string = "";
  name: string = "";
  parent: any = null;
}

export class TFile extends TAbstractFile {
  stat: any = {};
  basename: string = "";
  extension: string = "md";
}

export class TFolder extends TAbstractFile {
  children: TAbstractFile[] = [];
  isRoot(): boolean {
    return this.path === "" || this.path === "/";
  }
}

export class Notice {
  message: string | DocumentFragment;
  duration?: number;
  static notices: string[] = [];

  constructor(message: string | DocumentFragment, duration?: number) {
    this.message = message;
    this.duration = duration;
    Notice.notices.push(typeof message === "string" ? message : "Fragment");
  }

  static clear(): void {
    Notice.notices = [];
  }
}

export class MarkdownView {
  file: TFile | null = null;
}

export class MockLeaf {
  openedFile: TFile | null = null;
  active: boolean = false;
  view: any = {};
  pinned: boolean = false;

  getViewState() {
    return { pinned: this.pinned };
  }

  async openFile(file: TFile, options?: { active?: boolean }): Promise<void> {
    this.openedFile = file;
    this.active = options?.active ?? false;
    this.view = { file };
  }
}

export class PluginSettingTab {
  app: any;
  plugin: any;
  containerEl: any;

  constructor(app: any, plugin: any) {
    this.app = app;
    this.plugin = plugin;
    this.containerEl = {
      empty() {},
      createEl() {
        return {
          setText() {},
          append() {},
        };
      },
    };
  }
}

export class Setting {
  constructor(public containerEl: any) {}
  setName(_name: string) { return this; }
  setDesc(_desc: any) { return this; }
  addText(cb: any) {
    cb({
      setPlaceholder() { return this; },
      setValue() { return this; },
      onChange() { return this; },
    });
    return this;
  }
}

export class Plugin {
  app: any;
  manifest: any;
  addRibbonIcon() {}
  addCommand() {}
  addSettingTab() {}
  async loadData(): Promise<any> { return {}; }
  async saveData(_data: any): Promise<void> {}
}

export interface App {
  vault: any;
  workspace: any;
}
