import { moment } from "obsidian";

/**
 * Returns a moment instance representing the current moment.
 * Prioritizes window.moment if running inside Obsidian, or Obsidian's moment import.
 */
export function getNowMoment(): moment.Moment {
  if (typeof window !== "undefined" && typeof (window as unknown as { moment?: () => moment.Moment }).moment === "function") {
    return (window as unknown as { moment: () => moment.Moment }).moment();
  }
  return moment();
}

/**
 * Computes the target offset date using window.moment().add(offsetDays, 'days').
 * @param offsetDays Number of days to offset from today (1 for tomorrow, etc.)
 */
export function computeTargetMoment(offsetDays: number): moment.Moment {
  return getNowMoment().add(offsetDays, "days");
}

export interface SubstituteTokensOptions {
  templateContent: string;
  targetMoment: moment.Moment;
  dateFormat: string;
  title: string;
  referenceTime?: moment.Moment;
}

/**
 * Replaces {{date}}, {{date:FORMAT}}, {{title}}, {{time}}, and {{time:FORMAT}} tokens
 * within the provided template content.
 */
export function substituteTokens(options: SubstituteTokensOptions): string {
  const { templateContent, targetMoment, dateFormat, title, referenceTime } = options;
  if (!templateContent) {
    return "";
  }

  const now = referenceTime ?? getNowMoment();
  let result = templateContent;

  // Replace {{title}} respecting backslash parity (even backslashes = evaluate, odd = escaped)
  result = result.replace(
    /(^|[^\\])((?:\\\\)*)\{\{\s*title\s*\}\}/gi,
    (_match, prefix, backslashes) => prefix + backslashes + title
  );

  // Replace {{date}} and {{date:FORMAT}} respecting backslash parity
  result = result.replace(
    /(^|[^\\])((?:\\\\)*)\{\{\s*date(?:\s*:\s*([^}\n\r]+?)\s*)?\s*\}\}/gi,
    (_match, prefix, backslashes, customFormat) => {
      const formatToUse = customFormat && customFormat.trim() ? customFormat.trim() : dateFormat;
      let formattedDate: string;
      try {
        formattedDate = targetMoment.format(formatToUse);
      } catch {
        formattedDate = targetMoment.format(dateFormat);
      }
      return prefix + backslashes + formattedDate;
    }
  );

  // Replace {{time}} and {{time:FORMAT}} respecting backslash parity
  result = result.replace(
    /(^|[^\\])((?:\\\\)*)\{\{\s*time(?:\s*:\s*([^}\n\r]+?)\s*)?\s*\}\}/gi,
    (_match, prefix, backslashes, customFormat) => {
      const formatToUse = customFormat && customFormat.trim() ? customFormat.trim() : "HH:mm";
      let formattedTime: string;
      try {
        formattedTime = now.format(formatToUse);
      } catch {
        formattedTime = now.format("HH:mm");
      }
      return prefix + backslashes + formattedTime;
    }
  );

  // Unescape any deliberately escaped braces (e.g. \{{date}} -> {{date}})
  result = result.replace(/\\\{/g, "{").replace(/\\\}/g, "}");

  return result;
}
