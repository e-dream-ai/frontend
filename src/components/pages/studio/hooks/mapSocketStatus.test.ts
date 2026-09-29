import { describe, it, expect } from "vitest";
import { mapSocketStatus } from "./mapSocketStatus";

describe("mapSocketStatus", () => {
  it("maps COMPLETED to processed", () => {
    expect(mapSocketStatus("COMPLETED")).toBe("processed");
  });

  it("keeps a COMPLETED job that is still ingesting as processing", () => {
    expect(mapSocketStatus("COMPLETED", "ingesting")).toBe("processing");
  });

  it("maps COMPLETED at the completed stage to processed", () => {
    expect(mapSocketStatus("COMPLETED", "completed")).toBe("processed");
  });

  it("maps IN_PROGRESS to processing", () => {
    expect(mapSocketStatus("IN_PROGRESS")).toBe("processing");
  });

  it("maps IN_QUEUE to queue", () => {
    expect(mapSocketStatus("IN_QUEUE")).toBe("queue");
  });

  it("maps FAILED to failed", () => {
    expect(mapSocketStatus("FAILED")).toBe("failed");
  });

  it("returns undefined for unrecognized status", () => {
    expect(mapSocketStatus("UNKNOWN")).toBeUndefined();
  });

  it("returns undefined when status is undefined", () => {
    expect(mapSocketStatus(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(mapSocketStatus("")).toBeUndefined();
  });
});
