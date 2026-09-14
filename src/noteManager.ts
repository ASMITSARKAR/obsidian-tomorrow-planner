import {
  App,
  MarkdownView,
  Notice,
  TFile,
  TFolder,
  Vault,
  normalizePath,
} from "obsidian";
import type { TomorrowPluginSettings } from "./settings";
import { computeTargetMoment, substituteTokens } from "./tokenUtils";

export class NoteManager {
  private app: App;
  private getSettings: () => TomorrowPluginSettings;

  constructor(app: App, getSettings: () => TomorrowPluginSettings) {
    this.app = app;
    this.getSettings = getSettings;
  }

  /**
   * Resolves the target date, checks for note existence, and either opens
   * the existing note or safely creates a new one from template.
   */
  async createOrOpenTomorrowDailyNote(): Promise<TFile | null> {
    try {
      const settings = this.getSettings();
      const offsetDays = typeof settings.offsetDays === "number" ? settings.offsetDays : 1;
      const targetMoment = computeTargetMoment(offsetDays);
      const dateFormat = settings.dateFormat?.trim() || "DD-MM-YYYY";
      const targetDate = targetMoment.format(dateFormat);

      const targetFilePath = this.resolveNotePath(settings.folderPath, targetDate);

      // Check if file already exists
      const existingFile = this.app.vault.getAbstractFileByPath(targetFilePath);

      if (existingFile instanceof TFile) {
        new Notice(`Daily note for ${targetDate} already exists. Opening...`);
        await this.openFile(existingFile);
        return existingFile;
      }

      // If existing path is a folder (abnormal collision), report error and abort
      if (existingFile instanceof TFolder) {
        new Notice(`Error: Target path "${targetFilePath}" is an existing folder.`);
        return null;
      }

      // File does not exist: ensure target directory exists
      const dirPath = this.extractParentDirectory(targetFilePath);
      if (dirPath) {
        await this.ensureFolderExists(this.app.vault, dirPath);
      }

      // Resolve template content safely
      const templateContent = await this.readTemplateSafe(settings.templatePath);

      // Perform full token substitution
      const noteContent = substituteTokens({
        templateContent,
        targetMoment,
        dateFormat,
        title: targetDate,
      });

      // Write to vault (guaranteed zero overwrite since we checked existence)
      const createdFile = await this.app.vault.create(targetFilePath, noteContent);
      new Notice(`Created tomorrow's daily note: ${createdFile.basename}`);

      // Open newly created note in active workspace leaf
      await this.openFile(createdFile);
      return createdFile;
    } catch (error) {
      console.error("Tomorrow Daily Note failed:", error);
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`Error creating daily note: ${message}`);
      return null;
    }
  }

  /**
   * Resolves the normalized vault file path for the target note.
   */
  resolveNotePath(folderPath: string, targetDate: string): string {
    const rawFolder = folderPath ? folderPath.trim() : "";
    const cleanFolder = normalizePath(rawFolder);
    const fileName = `${targetDate}.md`;

    if (!cleanFolder || cleanFolder === "/" || cleanFolder === ".") {
      return normalizePath(fileName);
    }
    return normalizePath(`${cleanFolder}/${fileName}`);
  }

  /**
   * Extracts the parent directory path from a normalized file path.
   */
  extractParentDirectory(filePath: string): string {
    const lastSlash = filePath.lastIndexOf("/");
    return lastSlash > -1 ? filePath.substring(0, lastSlash) : "";
  }

  /**
   * Recursively ensures that all directories in the given folder path exist.
   */
  async ensureFolderExists(vault: Vault, folderPath: string): Promise<void> {
    const normalized = normalizePath(folderPath.trim());
    if (!normalized || normalized === "/" || normalized === ".") {
      return;
    }

    const segments = normalized.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const file = vault.getAbstractFileByPath(currentPath);

      if (!file) {
        await vault.createFolder(currentPath);
      } else if (!(file instanceof TFolder)) {
        throw new Error(`Path "${currentPath}" exists but is not a folder.`);
      }
    }
  }

  /**
   * Safely reads the template file content without throwing unhandled rejections.
   * Handles empty paths, missing files, or invalid paths gracefully.
   */
  async readTemplateSafe(templatePath: string | undefined): Promise<string> {
    if (!templatePath || !templatePath.trim()) {
      return "";
    }

    const rawPath = templatePath.trim();
    // Try original normalized path, or with .md extension if omitted
    const candidatePaths = [
      normalizePath(rawPath),
      normalizePath(rawPath.endsWith(".md") ? rawPath : `${rawPath}.md`),
    ];

    for (const path of candidatePaths) {
      try {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
          return await this.app.vault.read(file);
        }
      } catch (err) {
        console.warn(`Could not read template at path "${path}":`, err);
      }
    }

    new Notice(`Template file "${rawPath}" not found. Creating note with empty template.`);
    return "";
  }

  /**
   * Focuses an existing open leaf containing the file, or opens it in an active, unpinned leaf.
   */
  private async openFile(file: TFile): Promise<void> {
    // 1. Search across open leaves to reuse existing tab/split if file is already open
    const markdownLeaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of markdownLeaves) {
      if (leaf.view instanceof MarkdownView && leaf.view.file?.path === file.path) {
        this.app.workspace.setActiveLeaf(leaf, { focus: true });
        return;
      }
    }

    // 2. Leaf acquisition with pin protection: never overwrite a pinned tab
    let leaf = this.app.workspace.getLeaf(false);
    if (leaf?.getViewState()?.pinned) {
      leaf = this.app.workspace.getLeaf(true);
    }

    await leaf.openFile(file, { active: true });
  }
}
