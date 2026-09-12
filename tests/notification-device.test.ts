import { describe, expect, it } from "vitest";
import { notificationDeviceStatusLabel } from "../lib/notification-device-status";

describe("notification device verification", () => {
  it("requires a native device on web", () => {
    expect(notificationDeviceStatusLabel({ platform: "web", permission: "unsupported", granted: false, channelReady: false, canSchedule: false })).toBe("Native device required");
  });

  it("distinguishes permission and Android channel readiness", () => {
    expect(notificationDeviceStatusLabel({ platform: "ios", permission: "denied", granted: false, channelReady: true, canSchedule: false })).toBe("Permission needed");
    expect(notificationDeviceStatusLabel({ platform: "android", permission: "granted", granted: true, channelReady: false, canSchedule: false })).toBe("Android channel not ready");
  });

  it("reports a ready native device", () => {
    expect(notificationDeviceStatusLabel({ platform: "android", permission: "granted", granted: true, channelReady: true, canSchedule: true })).toBe("Ready for notifications");
    expect(notificationDeviceStatusLabel(null)).toBe("Not checked");
  });
});
