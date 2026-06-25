import { describe, expect, it } from "bun:test"

import { isInternalDashboardHref } from "./chat-message"

describe("isInternalDashboardHref", () => {
  it("returns true for a deep dashboard scoring path", () => {
    expect(isInternalDashboardHref("/dashboard/partners/12/scoring")).toBe(true)
  })

  it("returns true for a dashboard contacts path", () => {
    expect(isInternalDashboardHref("/dashboard/contacts")).toBe(true)
  })

  it("returns false for an https url", () => {
    expect(isInternalDashboardHref("https://example.com")).toBe(false)
  })

  it("returns false for an http url", () => {
    expect(isInternalDashboardHref("http://x")).toBe(false)
  })

  it("returns false for a mailto link", () => {
    expect(isInternalDashboardHref("mailto:a@b.c")).toBe(false)
  })

  it("returns false for an in-page anchor", () => {
    expect(isInternalDashboardHref("#anchor")).toBe(false)
  })

  it("returns false for a protocol-relative url", () => {
    expect(isInternalDashboardHref("//evil.com")).toBe(false)
  })

  it("returns false for undefined", () => {
    expect(isInternalDashboardHref(undefined)).toBe(false)
  })

  it("returns false for a non-dashboard app path", () => {
    expect(isInternalDashboardHref("/other/path")).toBe(false)
  })
})
