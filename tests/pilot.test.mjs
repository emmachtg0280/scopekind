import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker, { validateApplication } from "../src/worker.js";
const valid = {
  name: "Test Creative",
  email: "test@example.com",
  discipline: "Brand design",
  frequency: "Often",
  message: "",
  consent: "on",
};
const request = (data = valid, origin = "https://example.com") =>
  new Request("https://example.com/api/pilot", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: JSON.stringify(data),
  });

test("Accepts applications from the newly included freelance disciplines", async () => {
  for (const discipline of [
    "Graphic design",
    "Development",
    "Copywriting",
    "Photography",
  ]) {
    let stored;
    const DB = {
      prepare: () => ({
        bind: (...values) => ({
          run: async () => {
            stored = values;
            return { success: true };
          },
        }),
      }),
    };
    const response = await worker.fetch(request({ ...valid, discipline }), {
      DB,
    });
    assert.equal(response.status, 201);
    assert.ok(stored.includes(discipline));
  }
});
test("Validates required consent and bounded input", () => {
  assert.ok(validateApplication(valid));
  assert.ok(
    validateApplication({
      name: "Beta Tester",
      email: "beta@example.com",
      discipline: "Brand design",
      consent: "on",
    }),
  );
  for (const patch of [
    { consent: "" },
    { email: "invalid" },
    { name: "x".repeat(101) },
    { message: "x".repeat(2001) },
    { discipline: "invalid" },
    { frequency: "invalid" },
    { website: "bot.example" },
    { email: [] },
  ]) {
    assert.equal(validateApplication({ ...valid, ...patch }), null);
  }
});
test("Stores parameterized values in SQLite and deduplicates normalized emails", async () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(
      readFileSync(
        new URL("../migrations/0001_pilot.sql", import.meta.url),
        "utf8",
      ),
    );
    const DB = {
      prepare(sql) {
        return {
          bind(...values) {
            return {
              async run() {
                db.prepare(sql).run(...values);
                return { success: true };
              },
            };
          },
        };
      },
    };
    assert.equal((await worker.fetch(request(), { DB })).status, 201);
    assert.equal(
      (
        await worker.fetch(
          request({
            ...valid,
            email: " TEST@example.com ",
            message: "It's approved; DROP TABLE pilot_applications;",
          }),
          { DB },
        )
      ).status,
      201,
    );
    const rows = db.prepare("SELECT * FROM pilot_applications").all();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, valid.email);
    assert.equal(
      rows[0].message,
      "It's approved; DROP TABLE pilot_applications;",
    );
    const originalDate = rows[0].created_at;
    assert.equal(
      (
        await worker.fetch(request({ email: valid.email, consent: "on" }), {
          DB,
        })
      ).status,
      201,
    );
    const preserved = db.prepare("SELECT * FROM pilot_applications").get();
    assert.equal(preserved.name, valid.name);
    assert.equal(preserved.discipline, valid.discipline);
    assert.equal(preserved.message, rows[0].message);
    assert.equal(preserved.created_at, originalDate);
    assert.equal(
      (
        await worker.fetch(
          request({ email: "new@example.com", consent: "on" }),
          { DB },
        )
      ).status,
      201,
    );
    const fresh = db
      .prepare("SELECT * FROM pilot_applications WHERE email = ?")
      .get("new@example.com");
    assert.equal(fresh.name, "");
    assert.equal(fresh.discipline, "");
    assert.equal(
      (
        await worker.fetch(
          request({
            email: "new@example.com",
            consent: "on",
            discipline: "Graphic design",
            message: "Unclear feedback",
          }),
          { DB },
        )
      ).status,
      201,
    );
    assert.equal(
      db
        .prepare("SELECT message FROM pilot_applications WHERE email = ?")
        .get("new@example.com").message,
      "Unclear feedback",
    );
  } finally {
    db.close();
  }
});
test("Storage failures never produce false success", async () => {
  assert.equal((await worker.fetch(request(), {})).status, 503);
  for (const run of [
    async () => {
      throw Error("offline");
    },
    async () => ({ success: false }),
  ]) {
    assert.equal(
      (
        await worker.fetch(request(), {
          DB: { prepare: () => ({ bind: () => ({ run }) }) },
        })
      ).status,
      503,
    );
  }
});
test("Cross-origin requests and invalid input are rejected before storage", async () => {
  assert.equal(
    (await worker.fetch(request(valid, "https://other.example"), {})).status,
    403,
  );
  assert.equal(
    (await worker.fetch(request({ ...valid, consent: "" }), {})).status,
    400,
  );
});
