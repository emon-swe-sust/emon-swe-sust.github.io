import { formatRange, parseRange } from "./dates";

test("keeps each existing date style when read and written back", () => {
  for (const text of ["Nov 2023 - Present", "2018-2022", "Present", "May 2025 - Present", "Oct 2021 - Jan 2023", "Aug 2021", ""]) {
    expect(formatRange(parseRange(text))).toBe(text);
  }
});

test("normalises long month names and en dashes", () => {
  expect(formatRange(parseRange("April 2025 - Present"))).toBe("Apr 2025 - Present");
  expect(formatRange(parseRange("2019 – 2021"))).toBe("2019-2021");
});

test("free-form text is not parsed", () => {
  expect(parseRange("Spring 2020")).toBeNull();
});
