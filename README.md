# Tomorrow Daily Note

[![GitHub Release](https://img.shields.io/github/v/release/ASMITSARKAR/obsidian-tomorrow-planner?style=flat-square)](https://github.com/ASMITSARKAR/obsidian-tomorrow-planner/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Desktop%20%7C%20Mobile-blueviolet?style=flat-square)](https://obsidian.md)

**Tomorrow Daily Note** is an Obsidian plugin that lets you seamlessly create or open tomorrow's (or +N days) daily note ahead of time — with zero accidental overwrites and full template token substitution.

---

## Why Tomorrow Daily Note?

Obsidian's built-in **Daily Notes** and **Periodic Notes** plugins are designed for the current day. When planning ahead in the evening, users often encounter friction:
- Manually calculating tomorrow's date or folder structure is tedious and error-prone.
- Date format workarounds (such as `(DD+1)`) evaluate literally as plain text.
- Overwrite risks can accidentally reset notes that were already drafted in advance.

**Tomorrow Daily Note** solves this with a reliable, one-click workflow:
- 📅 **Plan Ahead**: Instantly create or jump to tomorrow's daily note via a ribbon icon or hotkey.
- 🛡️ **Zero Overwrites**: If tomorrow's note already exists, the plugin focuses the open tab or leaf without altering its contents.
- 🔄 **Smart Token Replacement**: Evaluates `{{date}}`, `{{title}}`, `{{time}}`, and custom patterns (e.g. `{{date:YYYY-MM-DD}}` and `{{time:HH:mm:ss}}`).
- ⏱️ **Temporal Consistency**: `{{date}}` reflects the target offset date, while `{{time}}` accurately captures the real-world creation time.
- 📂 **Auto-Folder Resolution**: Recursively ensures intermediate destination directories (e.g., `Journal/Daily/2026`) exist before creating the file.
- 📱 **Mobile & Desktop**: Fully compatible with both Obsidian desktop and mobile apps (iOS & Android).

---

## Installation

### Method 1: Community Plugins Directory (Recommended)
1. In Obsidian, navigate to **Settings** > **Community plugins**.
2. Ensure **Restricted mode** is toggled **off**.
3. Click **Browse** and search for **Tomorrow Daily Note**.
4. Click **Install**, then click **Enable**.

### Method 2: Via Obsidian42 - BRAT (Beta Testing)
1. Install **BRAT** from Community plugins.
2. In BRAT settings, click **Add Beta plugin**.
3. Enter: `https://github.com/ASMITSARKAR/obsidian-tomorrow-planner`
4. BRAT will automatically install and update the plugin.

### Method 3: Manual Installation
1. Download the latest `main.js` and `manifest.json` from the [Releases](https://github.com/ASMITSARKAR/obsidian-tomorrow-planner/releases) page.
2. In your Obsidian vault, navigate to `.obsidian/plugins/`.
3. Create a folder named `tomorrow-daily-note`.
4. Place `main.js` and `manifest.json` into that folder.
5. In Obsidian, go to **Settings** > **Community plugins**, click **Reload plugins**, and toggle **Tomorrow Daily Note** on.

---

## How to Use

### Ribbon Button
Click the **Calendar Plus** (`calendar-plus`) icon in the left ribbon to immediately open or create tomorrow's note.

### Command Palette
Press `Ctrl+P` (or `Cmd+P` on macOS) and run:
> `Tomorrow Daily Note: Open tomorrow daily note`

*(Recommended: In **Settings > Hotkeys**, assign a shortcut such as `Ctrl+Shift+T` or `Cmd+Shift+T`.)*

---

## Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| **Date format** | `DD-MM-YYYY` | Format used for note filenames and the `{{date}}` token. Includes a live preview in settings. |
| **Offset days** | `1` | Number of days ahead (`1` for tomorrow, `2` for day after tomorrow, etc.). |
| **Folder path** | `Daily` | Vault folder where notes will be created. Intermediate directories are created automatically. |
| **Template file path** | `Daily/Demo Day.md` | Vault path to your Markdown template. If empty or missing, a blank note is created safely. |

---

## Template Syntax & Tokens

Templates support standard Obsidian Markdown formatting, YAML frontmatter, and dynamic tokens:

| Token | Description | Example Output |
| :--- | :--- | :--- |
| `{{title}}` | Base file title (without `.md`) | `15-09-2026` |
| `{{date}}` | Target note date in your configured format | `15-09-2026` |
| `{{date:YYYY-MM-DD}}` | Target note date formatted with custom pattern | `2026-09-15` |
| `{{date:dddd, MMMM Do YYYY}}` | Full day and date string | `Tuesday, September 15th 2026` |
| `{{time}}` | Real-world creation time (`HH:mm`) | `21:30` |
| `{{time:HH:mm:ss}}` | Real-world creation time with seconds | `21:30:45` |
| `Link: [[{{date}}]]` | Wiki-link formatting | `Link: [[15-09-2026]]` |
| `\{{date}}` | Escaped bracket (preserved literally) | `{{date}}` |

### Sample Template
```markdown
---
creation_date: {{date}} {{time}}
tags:
  - daily
  - logs
type: daily-note
---

# {{title}}

### 🎯 Primary Objectives (Rule of 3)
- [ ] 

### 📝 Action Items
- [ ] 

### 💭 Notes & Logs
> Log transient thoughts, derivations, or ideas.

- 
```

---

## Contributing & Support

- **Bug Reports & Feature Requests**: Please submit an issue on the [GitHub Issues](https://github.com/ASMITSARKAR/obsidian-tomorrow-planner/issues) page.
- **Pull Requests**: Pull requests and contributions are welcome!

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 [Asmit Sarkar](https://github.com/ASMITSARKAR).
