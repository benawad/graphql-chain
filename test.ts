import { chain } from "./lib";

describe("test chain", () => {
  it("modifying argument persists", () => {
    chain([
      (next, parent) => {
        parent.name = "hey";
        return next();
      },
      (next, parent) => {
        expect(parent.name).toBe("hey");
        return next();
      }
    ])(() => 5)({}, {}, {}, {});
  });
});
