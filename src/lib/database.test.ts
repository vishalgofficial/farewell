import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  postgres: vi.fn(), neon: vi.fn(), query: vi.fn(),
}));
vi.mock("postgres", () => ({ default: mocks.postgres }));
vi.mock("@neondatabase/serverless", () => ({ neon: mocks.neon }));

beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  mocks.query.mockResolvedValue([{ id: "1" }]);
  mocks.postgres.mockReturnValue(mocks.query); mocks.neon.mockReturnValue(mocks.query);
});
afterEach(() => vi.unstubAllEnvs());

describe("shared-note database transport", () => {
  it("uses one bounded PostgreSQL pool and keeps values parameterized", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://app:private@database:5432/app");
    const { database } = await import("./database");
    const sql = database();
    await sql`SELECT ${"Alice's note"}`;
    expect(database()).toBe(sql);
    expect(mocks.postgres).toHaveBeenCalledTimes(1);
    expect(mocks.postgres).toHaveBeenCalledWith(expect.any(String), { max: 5, connect_timeout: 10, idle_timeout: 20 });
    expect(mocks.query.mock.calls[0]![1]).toBe("Alice's note");
    expect(mocks.query.mock.calls[0]![0].join("")).not.toContain("Alice's note");
    expect(mocks.neon).not.toHaveBeenCalled();
  });
  it("preserves Neon HTTP for actual Neon hosts", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://app:private@ep-project.neon.tech/app?sslmode=require");
    const { database } = await import("./database");
    await database()`SELECT 1`;
    expect(mocks.neon).toHaveBeenCalledTimes(1); expect(mocks.postgres).not.toHaveBeenCalled();
  });
  it("does not mistake a suffix lookalike for Neon", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://app:private@neon.tech.example.com/app");
    const { database } = await import("./database");
    database(); expect(mocks.neon).not.toHaveBeenCalled(); expect(mocks.postgres).toHaveBeenCalledTimes(1);
  });
  it("reports missing or invalid configuration without echoing credentials", async () => {
    const { database } = await import("./database");
    vi.stubEnv("DATABASE_URL", ""); expect(database).toThrow("not configured");
    vi.stubEnv("DATABASE_URL", "https://app:private-value@database/app");
    expect(database).toThrow("URL is invalid");
    try { database(); } catch (error) { expect(String(error)).not.toContain("private-value"); }
  });
});
