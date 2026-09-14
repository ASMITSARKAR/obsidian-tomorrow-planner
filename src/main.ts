import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, TomorrowPluginSettings, TomorrowSettingTab } from "./settings";
import { NoteManager } from "./noteManager";

export default class TomorrowDailyNotePlugin extends Plugin {
  settings: TomorrowPluginSettings = DEFAULT_SETTINGS;
  noteManager!: NoteManager;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.noteManager = new NoteManager(this.app, () => this.settings);

    // Register ribbon icon
    this.addRibbonIcon("calendar-plus", "Open tomorrow daily note", async () => {
      await this.noteManager.createOrOpenTomorrowDailyNote();
    });

    // Register command palette entry
    this.addCommand({
      id: "open-tomorrow-daily-note",
      name: "Open tomorrow daily note",
      callback: async () => {
        await this.noteManager.createOrOpenTomorrowDailyNote();
      },
    });

    // Register plugin settings tab
    this.addSettingTab(new TomorrowSettingTab(this.app, this));
  }

  onunload(): void {
    // Resource cleanup handled automatically by Obsidian API
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
