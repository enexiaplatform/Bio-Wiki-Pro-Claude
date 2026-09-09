import { describe, expect, it } from "vitest";
import { authPath, isAdminWorkspaceReturnTo, safeAuthReturnTo } from "./auth-return";

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
    expect(safeAuthReturnTo("?returnTo=%2F%5Cevil.example", "/welcome")).toBe("/welcome");
  });

  it("supports the legacy internal next parameter without accepting an external target", () => {
    expect(safeAuthReturnTo("?next=%2Fadmin", "/welcome")).toBe("/admin");
    expect(safeAuthReturnTo("?next=https%3A%2F%2Fevil.example", "/welcome")).toBe("/welcome");
  });

  it("identifies restricted operational workspaces for contextual sign-in", () => {
    expect(isAdminWorkspaceReturnTo("/quality-lab/engagements/qlp_123#calibration")).toBe(true);
    expect(isAdminWorkspaceReturnTo("/quality-lab/pilots")).toBe(true);
    expect(isAdminWorkspaceReturnTo("/quality-lab/projects")).toBe(false);
  });
});
