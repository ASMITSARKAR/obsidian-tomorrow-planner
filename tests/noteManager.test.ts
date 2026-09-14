import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NoteManager } from "../src/noteManager";
import { TomorrowPluginSettings, DEFAULT_SETTINGS } from "../src/settings";
import { TFile, TFolder, Notice } from "./mocks/obsidian";

class MockVault {
  files: Map<string, { content: string; file: TFile | TFolder }> = new Map();

  getAbstractFileByPath(path: string): TFile | TFolder | null {
    const entry = this.files.get(path);
    return entry ? entry.file : null;
  }

  async createFolder(path: string): Promise<TFolder> {
    const folder = new TFolder();
    folder.path = path;
    folder.name = path.split("/").pop() || "";
    this.files.set(path, { content: "", file: folder });
    return folder;
  }

  async create(path: string, data: string): Promise<TFile> {
    if (this.files.has(path)) {
      throw new Error(`File already exists: ${path}`);
    }
    const file = new TFile();
    file.path = path;
    file.basename = path.split("/").pop()?.replace(/\.md$/, "") || "";
    file.name = path.split("/").pop() || "";
    this.files.set(path, { content: data, file });
    return file;
  }

  async read(file: TFile): Promise<string> {
    const entry = this.files.get(file.path);
    if (!entry) throw new Error("File not found");
    return entry.content;
  }
}

class MockLeaf {
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

class MockWorkspace {
  leaves: MockLeaf[] = [];
  activeLeaf: MockLeaf | null = null;
  getLeafCalls: Array<boolean | undefined> = [];

  getLeavesOfType(_type: string): MockLeaf[] {
    return this.leaves;
  }

  getLeaf(create?: boolean): MockLeaf {
    this.getLeafCalls.push(create);
    if (!create && this.activeLeaf) {
      return this.activeLeaf;
    }
    const leaf = new MockLeaf();
    this.leaves.push(leaf);
    this.activeLeaf = leaf;
    return leaf;
  }

  setActiveLeaf(leaf: MockLeaf, _options?: { focus?: boolean }): void {
    this.activeLeaf = leaf;
    leaf.active = true;
  }
}

describe("NoteManager", () => {
  let mockVault: MockVault;
  let mockWorkspace: MockWorkspace;
  let currentSettings: TomorrowPluginSettings;
  let manager: NoteManager;

  beforeEach(() => {
    mockVault = new MockVault();
    mockWorkspace = new MockWorkspace();
    currentSettings = { ...DEFAULT_SETTINGS };
    Notice.clear();

    const mockApp = {
      vault: mockVault,
      workspace: mockWorkspace,
    };

    manager = new NoteManager(mockApp as any, () => currentSettings);
  });

  describe("resolveNotePath", () => {
    it("should resolve path with folder correctly", () => {
      const path = manager.resolveNotePath("Daily", "15-09-2026");
      assert.equal(path, "Daily/15-09-2026.md");
    });

    it("should handle root folder / empty folder path", () => {
      assert.equal(manager.resolveNotePath("", "15-09-2026"), "15-09-2026.md");
      assert.equal(manager.resolveNotePath("/", "15-09-2026"), "15-09-2026.md");
      assert.equal(manager.resolveNotePath(".", "15-09-2026"), "15-09-2026.md");
    });

    it("should strip leading and trailing slashes in folder path", () => {
      assert.equal(manager.resolveNotePath("/Journal/Daily/", "15-09-2026"), "Journal/Daily/15-09-2026.md");
    });
  });

  describe("extractParentDirectory", () => {
    it("should return parent folder for nested paths", () => {
      assert.equal(manager.extractParentDirectory("Daily/note.md"), "Daily");
      assert.equal(manager.extractParentDirectory("A/B/C/note.md"), "A/B/C");
    });

    it("should return empty string for root files", () => {
      assert.equal(manager.extractParentDirectory("note.md"), "");
    });
  });

  describe("createOrOpenTomorrowDailyNote", () => {
    it("should create a new note with template when file does not exist", async () => {
      // Set up template
      const templateFile = new TFile();
      templateFile.path = "Daily/Demo Day.md";
      templateFile.basename = "Demo Day";
      mockVault.files.set("Daily/Demo Day.md", {
        content: "# {{title}}\nDate: {{date}}\nCreated at {{time}}",
        file: templateFile,
      });

      const created = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(created);
      assert.equal(created instanceof TFile, true);

      // Verify file written to vault
      const stored = mockVault.files.get(created.path);
      assert.ok(stored);
      assert.match(stored.content, /^# \d{2}-\d{2}-\d{4}/);
      assert.match(stored.content, /Date: \d{2}-\d{2}-\d{4}/);
      assert.match(stored.content, /Created at \d{2}:\d{2}/);

      // Verify leaf opened
      assert.equal(mockWorkspace.activeLeaf?.openedFile?.path, created.path);

      // Verify notice
      assert.ok(Notice.notices.some((n) => n.includes("Created tomorrow's daily note")));
    });

    it("should NOT overwrite existing file when note is already present (Guardrail)", async () => {
      // Pre-create the tomorrow note with existing content
      const offsetDays = currentSettings.offsetDays;
      const targetDate = (manager as any).computeTargetDateString?.() ||
        (await (async () => {
          const m = (await import("../src/tokenUtils")).computeTargetMoment(offsetDays);
          return m.format(currentSettings.dateFormat);
        })());

      const targetPath = `Daily/${targetDate}.md`;
      const originalContent = "### My Precious Pre-existing Tomorrow Notes!";
      const existingFile = new TFile();
      existingFile.path = targetPath;
      existingFile.basename = targetDate;
      mockVault.files.set(targetPath, {
        content: originalContent,
        file: existingFile,
      });

      // Call manager
      const opened = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(opened);
      assert.equal(opened.path, targetPath);

      // Verify content was NOT overwritten
      const stored = mockVault.files.get(targetPath);
      assert.equal(stored?.content, originalContent);

      // Verify notice mentions already exists
      assert.ok(Notice.notices.some((n) => n.includes("already exists. Opening...")));
    });

    it("should handle missing or blank template gracefully without unhandled rejection", async () => {
      currentSettings.templatePath = "NonExistent/MissingTemplate.md";

      const created = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(created);

      // Stored content should be empty string
      const stored = mockVault.files.get(created.path);
      assert.equal(stored?.content, "");

      // Verify warning notice about template
      assert.ok(Notice.notices.some((n) => n.includes("Template file \"NonExistent/MissingTemplate.md\" not found")));
      assert.ok(Notice.notices.some((n) => n.includes("Created tomorrow's daily note")));
    });

    it("should handle blank templatePath setting", async () => {
      currentSettings.templatePath = "";

      const created = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(created);

      const stored = mockVault.files.get(created.path);
      assert.equal(stored?.content, "");
    });

    it("should reuse an existing open markdown leaf instead of opening a duplicate tab", async () => {
      const targetDate = (await (async () => {
        const m = (await import("../src/tokenUtils")).computeTargetMoment(currentSettings.offsetDays);
        return m.format(currentSettings.dateFormat);
      })());
      const targetPath = `Daily/${targetDate}.md`;

      const existingFile = new TFile();
      existingFile.path = targetPath;
      existingFile.basename = targetDate;
      mockVault.files.set(targetPath, {
        content: "# Tomorrow Notes",
        file: existingFile,
      });

      // Existing leaf already open with this file in a split tab
      const existingLeaf = new MockLeaf();
      existingLeaf.openedFile = existingFile;
      const { MarkdownView } = await import("./mocks/obsidian");
      const view = new MarkdownView();
      view.file = existingFile;
      existingLeaf.view = view;
      mockWorkspace.leaves.push(existingLeaf);

      const result = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(result);
      // Active leaf should be focused to the existing leaf
      assert.equal(mockWorkspace.activeLeaf, existingLeaf);
      // getLeaf should NOT have been called because it was already open
      assert.equal(mockWorkspace.getLeafCalls.length, 0);
    });

    it("should acquire a new unpinned leaf when the active leaf is pinned (Pin Protection)", async () => {
      // Configure active leaf as pinned
      const pinnedLeaf = new MockLeaf();
      pinnedLeaf.pinned = true;
      mockWorkspace.activeLeaf = pinnedLeaf;

      const created = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(created);

      // getLeaf(true) must be called to create a new unpinned tab
      assert.ok(mockWorkspace.getLeafCalls.includes(true), "Expected getLeaf(true) to be called for pinned leaf");
      // The opened leaf must not be the pinned leaf
      assert.notEqual(mockWorkspace.activeLeaf, pinnedLeaf);
      assert.equal(mockWorkspace.activeLeaf?.openedFile?.path, created.path);
    });

    it("should create intermediate folders recursively via ensureFolderExists", async () => {
      currentSettings.folderPath = "Notes/Daily/2026";
      const created = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(created);

      // Verify each individual segment was created and exists
      assert.ok(mockVault.files.has("Notes"));
      assert.ok(mockVault.files.has("Notes/Daily"));
      assert.ok(mockVault.files.has("Notes/Daily/2026"));
      assert.ok(created.path.startsWith("Notes/Daily/2026/"));
    });

    it("should type-guard template against TFolder to prevent unhandled rejections", async () => {
      // User accidentally specifies a folder as template
      const folder = new TFolder();
      folder.path = "Templates/DailyFolder";
      mockVault.files.set("Templates/DailyFolder", { content: "", file: folder });
      currentSettings.templatePath = "Templates/DailyFolder";

      const created = await manager.createOrOpenTomorrowDailyNote();
      assert.ok(created);
      // Note content should safely fallback to empty string without calling vault.read() on the folder
      const stored = mockVault.files.get(created.path);
      assert.equal(stored?.content, "");
      assert.ok(Notice.notices.some((n) => n.includes("Template file \"Templates/DailyFolder\" not found")));
    });
  });
});
