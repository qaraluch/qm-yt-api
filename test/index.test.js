import test from "ava";
import ytAPI from "../dist/index.js";
import credentials from "../.key.json";

test("check credentials", t => {
  const msg1 = "should load api key";
  const actual1 = credentials.key.length > 0;
  const expected1 = true;
  t.is(actual1, expected1, msg1);
  const msg2 = "should load playlist id";
  const actual2 = credentials.playlist.length > 0;
  const expected2 = true;
  t.is(actual2, expected2, msg2);
});

// test("constructor function check", t => {
//   const msg = "should be a function i.e. construction fn.";
//   const actual = typeof ytAPI === "function";
//   const expected = true;
//   t.is(actual, expected, msg);
// });

// test("init", t => {
//   const msg1 = "should construction fn. return an object i.e. state";
//   const actual1 = typeof ytAPI() === "object";
//   const expected1 = true;
//   t.is(actual1, expected1, msg1);
// });
