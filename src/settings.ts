import { App, PluginSettingTab, Setting } from "obsidian";
import type TomorrowDailyNotePlugin from "./main";
import { computeTargetMoment } from "./tokenUtils";

export interface TomorrowPluginSettings {
  dateFormat: string;
  folderPath: string;
  templatePath: string;
  offsetDays: number;
}

export const DEFAULT_SETTINGS: TomorrowPluginSettings = {
  dateFormat: "DD-MM-YYYY",
  folderPath: "Daily",
  templatePath: "Daily/Demo Day.md",
  offsetDays: 1,
};

export class TomorrowSettingTab extends PluginSettingTab {
  plugin: TomorrowDailyNotePlugin;

  constructor(app: App, plugin: TomorrowDailyNotePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Date format setting with live preview on descEl (no document.createElement or document.createDocumentFragment)
    let previewEl: HTMLElement;

    const updatePreview = () => {
      if (previewEl) {
        try {
          const target = computeTargetMoment(this.plugin.settings.offsetDays);
          previewEl.setText(target.format(this.plugin.settings.dateFormat || DEFAULT_SETTINGS.dateFormat));
        } catch {
          previewEl.setText("Invalid date format");
        }
      }
    };

    const dateFormatSetting = new Setting(containerEl)
      .setName("Date format")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.dateFormat)
          .setValue(this.plugin.settings.dateFormat)
          .onChange(async (value) => {
            this.plugin.settings.dateFormat = value.trim() || DEFAULT_SETTINGS.dateFormat;
            updatePreview();
            await this.plugin.saveSettings();
          })
      );

    dateFormatSetting.descEl.createSpan({
      text: "Format used for the note file title and the {{date}} template token. ",
    });
    dateFormatSetting.descEl.createEl("br");
    dateFormatSetting.descEl.appendText("Live preview: ");
    previewEl = dateFormatSetting.descEl.createEl("strong", {
      text: "",
      cls: "u-pop",
    });
    updatePreview();

    // Offset days setting
    new Setting(containerEl)
      .setName("Offset days")
      .setDesc("Number of days to offset from today. Default is 1 for tomorrow (+2 for the day after tomorrow, etc.).")
      .addText((text) =>
        text
          .setPlaceholder(String(DEFAULT_SETTINGS.offsetDays))
          .setValue(String(this.plugin.settings.offsetDays))
          .onChange(async (value) => {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed >= 0) {
              this.plugin.settings.offsetDays = parsed;
            } else {
              this.plugin.settings.offsetDays = DEFAULT_SETTINGS.offsetDays;
            }
            updatePreview();
            await this.plugin.saveSettings();
          })
      );

    // Destination folder path setting
    new Setting(containerEl)
      .setName("Folder path")
      .setDesc("Vault folder where daily notes will be created (e.g., 'Daily' or 'Journal/Daily'). Will be created automatically if missing.")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.folderPath)
          .setValue(this.plugin.settings.folderPath)
          .onChange(async (value) => {
            this.plugin.settings.folderPath = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // Template file path setting
    new Setting(containerEl)
      .setName("Template file path")
      .setDesc("Vault path to a markdown template (e.g., 'Daily/Demo Day.md'). Supports {{date}}, {{title}}, {{time}}, and {{date:FORMAT}}. Leave blank for an empty note.")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.templatePath)
          .setValue(this.plugin.settings.templatePath)
          .onChange(async (value) => {
            this.plugin.settings.templatePath = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
