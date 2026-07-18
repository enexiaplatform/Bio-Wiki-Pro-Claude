import { describe, expect, it } from "vitest";
import { authPath, safeAuthReturnTo } from "./auth-return";

describe("auth return targets", () => {
  it("preserves an internal path with its own query string", () => {
    const target = "/quality-lab/review?offer=diagnostic";
    const path = authPath("/register", target);
    expect(path).toBe("/register?returnTo=%2Fquality-lab%2Freview%3Foffer%3Ddiagnostic");
    expect(safeAuthReturnTo(path.slice(path.indexOf("?")), "/welcome")).toBe(target);
  });

  it("rejects absolute and protocol-relative redirects", () => {
    expect(safeAuthReturnTo("?returnTo=https%3A%2F%2Fevil.example", "/welcome")).toBe("/welcome");
    expect(safeAuthReturnTo("?returnTo=%2F%2Fevil.example", "/welcome")).toBe("/welcome");
  });
});
