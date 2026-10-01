import { expect, it } from "vitest";
import { toCsv } from "./csv";
it("escapes quotes and delimiters and neutralizes spreadsheet formulas", () => {
  expect(
    toCsv([
      ["Activo", "Nota"],
      ["api,prod", 'texto "citado"'],
      ["=CMD()", "+1"],
      ["\t=CMD()", "@x"],
    ]),
  ).toBe(
    '\uFEFF"Activo","Nota"\r\n"api,prod","texto ""citado"""\r\n"\'=CMD()","\'+1"\r\n"\'\t=CMD()","\'@x"',
  );
});
