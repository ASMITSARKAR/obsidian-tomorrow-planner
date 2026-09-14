# Tomorrow Daily Note (`tomorrow-daily-note`)

An Obsidian Community Plugin that lets you seamlessly create or open tomorrow's (or +N days) daily note ahead of time — with zero accidental overwrites and full template token substitution.

---

## Why this plugin?

Obsidian's core **Daily Notes** and **Periodic Notes** plugins are designed for the current day. When planning ahead for tomorrow in the evening, users often resort to manual date math or complicated templates that frequently evaluate date formats literally (e.g. `(DD+1)` evaluating as raw text).

**Tomorrow Daily Note** solves this cleanly:
- 📅 **Plan Ahead**: Open tomorrow's note with a single hotkey or ribbon click.
- 🛡️ **Zero Overwrites**: If the target daily note already exists, it is focused in your workspace without modifying its contents.
- 🔄 **Full Template Support**: Substitutes `{{date}}`, `{{title}}`, `{{time}}`, and custom formats like `{{date:YYYY-MM-DD}}` and `{{time:HH:mm:ss}}`.
- ⚙️ **Configurable Offset**: Plan +1 day (tomorrow), +2 days, or whatever offset fits your workflow.
- 📂 **Auto Folder Creation**: Automatically creates nested folders if your configured folder path does not exist yet.

---

## Installation

### Manual Installation
1. Download `main.js` and `manifest.json` from the latest release.
2. In your Obsidian vault, navigate to `.obsidian/plugins/`.
3. Create a folder named `tomorrow-daily-note`.
4. Copy `main.js` and `manifest.json` into that folder.
5. In Obsidian, go to **Settings > Community plugins**, reload, and enable **Tomorrow Daily Note**.

---

## Usage

### Ribbon Icon
Click the **Calendar Plus** (`calendar-plus`) icon in the left ribbon to immediately open or create tomorrow's note.

### Command Palette
Open the command palette (`Ctrl+P` or `Cmd+P`) and search for:
> `Tomorrow Daily Note: Open tomorrow daily note`

*(Tip: You can assign a custom hotkey to this command, such as `Ctrl+Shift+T` or `Cmd+Shift+T`)*.

---

## Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| **Date format** | `DD-MM-YYYY` | Format for note filenames and the `{{date}}` token. Live preview included in settings. |
| **Offset days** | `1` | Number of days ahead (1 for tomorrow, 2 for day after tomorrow, etc.). |
| **Folder path** | `Daily` | Destination folder in your vault. Created automatically if missing. |
| **Template file path** | `Daily/Demo Day.md` | Path to your Markdown template. If left blank or missing, creates an empty note safely. |

---

## Template Tokens

Your template markdown file can include any of the following tokens:

| Token | Description | Example Output |
| :--- | :--- | :--- |
| `{{title}}` | Base file title (without `.md`) | `15-09-2026` |
| `{{date}}` | Target note date in your configured format | `15-09-2026` |
| `{{date:YYYY-MM-DD}}` | Target note date formatted with custom pattern | `2026-09-15` |
| `{{date:dddd, MMMM Do YYYY}}` | Full date string | `Tuesday, September 15th 2026` |
| `{{time}}` | Current time in `HH:mm` format | `21:30` |
| `{{time:HH:mm:ss}}` | Current time with custom format | `21:30:00` |

---

## Development

```bash
# Install dependencies
npm install

# Build production bundle (main.js)
npm run build

# Start esbuild watch mode for development
npm run dev

# Run automated test suite
npm run test
```

## Author
Created by **Asmit Sarkar** ([GitHub: @ASMITSARKAR](https://github.com/ASMITSARKAR))

## License
MIT License - Copyright (c) 2026 Asmit Sarkar. See [LICENSE](LICENSE) for details.
