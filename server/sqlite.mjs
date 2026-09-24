import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
export function database(path = ":memory:") {
  const sqlite = new DatabaseSync(path);
  sqlite.exec(
    readFileSync(
      new URL("./migrations/0001_sestet.sql", import.meta.url),
      "utf8",
    ),
  );
  const prepare = (sql) => ({
    bind(...args) {
      const stmt = sqlite.prepare(sql);
      return {
        first: async () => stmt.get(...args) || null,
        all: async () => ({ results: stmt.all(...args) }),
        run: async () => {
          const r = stmt.run(...args);
          return { meta: { changes: Number(r.changes) } };
        },
        _run: () => stmt.run(...args),
      };
    },
  });
  return {
    sqlite,
    prepare,
    batch: async (statements) => {
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        const result = statements.map((s) => s._run());
        sqlite.exec("COMMIT");
        return result;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
    close: () => sqlite.close(),
  };
}
