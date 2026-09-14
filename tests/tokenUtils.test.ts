import { describe, it } from "node:test";
import assert from "node:assert/strict";
import momentLib from "moment";
import { computeTargetMoment, substituteTokens } from "../src/tokenUtils";

describe("tokenUtils", () => {
  describe("computeTargetMoment", () => {
    it("should compute tomorrow's date with offsetDays = 1", () => {
      const today = momentLib();
      const target = computeTargetMoment(1);
      const diffDays = target.diff(today, "days");
      assert.equal(diffDays, 1);
      assert.equal(target.format("YYYY-MM-DD"), today.add(1, "day").format("YYYY-MM-DD"));
    });

    it("should compute target date for +N days", () => {
      const today = momentLib();
      const target = computeTargetMoment(7);
      assert.equal(target.format("YYYY-MM-DD"), today.add(7, "days").format("YYYY-MM-DD"));
    });

    it("should compute today when offsetDays = 0", () => {
      const today = momentLib();
      const target = computeTargetMoment(0);
      assert.equal(target.format("YYYY-MM-DD"), today.format("YYYY-MM-DD"));
    });
  });

  describe("substituteTokens", () => {
    const fixedTarget = momentLib("2026-09-15 14:30:00");
    const fixedNow = momentLib("2026-09-14 09:15:22");

    it("should substitute {{title}}", () => {
      const template = "# {{title}}\n\nNotes for {{title}}";
      const result = substituteTokens({
        templateContent: template,
        targetMoment: fixedTarget,
        dateFormat: "DD-MM-YYYY",
        title: "15-09-2026",
        referenceTime: fixedNow,
      });

      assert.equal(result, "# 15-09-2026\n\nNotes for 15-09-2026");
    });

    it("should substitute {{date}} using the configured dateFormat", () => {
      const template = "Daily Log: {{date}}";
      const result = substituteTokens({
        templateContent: template,
        targetMoment: fixedTarget,
        dateFormat: "DD-MM-YYYY",
        title: "15-09-2026",
        referenceTime: fixedNow,
      });

      assert.equal(result, "Daily Log: 15-09-2026");
    });

    it("should substitute custom {{date:FORMAT}} patterns", () => {
      const template = "ISO: {{date:YYYY-MM-DD}} | Year: {{date:YYYY}} | Day: {{date:dddd}}";
      const result = substituteTokens({
        templateContent: template,
        targetMoment: fixedTarget,
        dateFormat: "DD-MM-YYYY",
        title: "15-09-2026",
        referenceTime: fixedNow,
      });

      assert.equal(result, "ISO: 2026-09-15 | Year: 2026 | Day: Tuesday");
    });

    it("should substitute {{time}} and custom {{time:FORMAT}}", () => {
      const template = "Created at {{time}} (seconds: {{time:HH:mm:ss}})";
      const result = substituteTokens({
        templateContent: template,
        targetMoment: fixedTarget,
        dateFormat: "DD-MM-YYYY",
        title: "15-09-2026",
        referenceTime: fixedNow,
      });

      assert.equal(result, "Created at 09:15 (seconds: 09:15:22)");
    });

    it("should handle the exact user snippet with multiple tokens, internal links, and escaped brackets", () => {
      const template =
        "Creation: {{date:YYYY-MM-DD}} at {{time:HH:mm:ss}}\n" +
        "Link: [[{{date}}]]\n" +
        "Raw bracket: \\{\\{date\\}\\}";

      const result = substituteTokens({
        templateContent: template,
        targetMoment: fixedTarget,
        dateFormat: "DD-MM-YYYY",
        title: "15-09-2026",
        referenceTime: fixedNow,
      });

      const expected =
        "Creation: 2026-09-15 at 09:15:22\n" +
        "Link: [[15-09-2026]]\n" +
        "Raw bracket: {{date}}";

      assert.equal(result, expected);
    });

    it("should ensure {{date}} uses target offset date while {{time}} uses current system clock", () => {
      const template = "Target: {{date:YYYY-MM-DD}} | CreatedAt: {{time:HH:mm}}";
      const tomorrow = momentLib("2026-09-15 14:00:00");
      const currentRealTime = momentLib("2026-09-14 22:45:00");

      const result = substituteTokens({
        templateContent: template,
        targetMoment: tomorrow,
        dateFormat: "YYYY-MM-DD",
        title: "2026-09-15",
        referenceTime: currentRealTime,
      });

      assert.equal(result, "Target: 2026-09-15 | CreatedAt: 22:45");
    });

    it("should handle variable whitespace without greedy cross-line matching", () => {
      const template = "Line 1: {{ date }}\nLine 2: {{  date:YYYY-MM-DD  }}\nLine 3: {{   time   }}";
      const result = substituteTokens({
        templateContent: template,
        targetMoment: fixedTarget,
        dateFormat: "DD-MM-YYYY",
        title: "15-09-2026",
        referenceTime: fixedNow,
      });

      const expected = "Line 1: 15-09-2026\nLine 2: 2026-09-15\nLine 3: 09:15";
      assert.equal(result, expected);
    });

    it("should handle empty or whitespace templates gracefully", () => {
      assert.equal(
        substituteTokens({
          templateContent: "",
          targetMoment: fixedTarget,
          dateFormat: "DD-MM-YYYY",
          title: "15-09-2026",
        }),
        ""
      );
    });

    it("should preserve templates without tokens intact", () => {
      const template = "## Fixed Heading\n\n- Task 1\n- Task 2";
      const result = substituteTokens({
        templateContent: template,
        targetMoment: fixedTarget,
        dateFormat: "DD-MM-YYYY",
        title: "15-09-2026",
        referenceTime: fixedNow,
      });

      assert.equal(result, template);
    });
  });
});
