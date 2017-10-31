import test from "ava";
import ytAPI from "../dist/index.js";
import credentials from "../test/.key.json";

// Tests are made against real YT data!
const key = credentials.key;
const video = credentials.video;

test("check credentials", t => {
  const msg1 = "should load api key";
  const actual1 = credentials.key.length > 0;
  const expected1 = true;
  t.is(actual1, expected1, msg1);
  const msg2 = "should load playlist id";
  const actual2 = credentials.playlist.length > 0;
  const expected2 = true;
  t.is(actual2, expected2, msg2);
  const msg3 = "should load vidoe id";
  const actual3 = credentials.video.length > 0;
  const expected3 = true;
  t.is(actual3, expected3, msg3);
});

test("constructor function check", t => {
  const msg = "should be a function i.e. construction fn.";
  const actual = typeof ytAPI.getVideoInfo === "function";
  const expected = true;
  t.is(actual, expected, msg);
});

test("return promise istance", t => {
  const msg = "should return promise istance";
  const actual = ytAPI.getVideoInfo() instanceof Promise;
  const expected = true;
  t.is(actual, expected, msg);
});

const expectedVideoInfo = {
  id: "8CrOL-ydFMI",
  title: "This Is Water - Full version-David Foster Wallace Commencement Speech"
};

test("get video info from YT", async t => {
  const msg = "should get video info";
  const data = await ytAPI.getVideoInfo(key, video);
  const actual = data;
  delete data.errors;
  const expected = expectedVideoInfo;
  t.deepEqual(actual, expected, msg);
});

const expectedErrorObj = {
  id: undefined,
  title: undefined
};

//TODOC: when id of video not found, not errors are thrown by YT API
test("wrong video Id", async t => {
  const msg = "should return undefined";
  const data = await ytAPI.getVideoInfo(key, "12345555553");
  const actual = data;
  delete data.errors;
  const expected = expectedErrorObj;
  t.deepEqual(actual, expected, msg);
});

test("bubble up API request errors", async t => {
  const msg = "should get video info";
  const data = await ytAPI.getVideoInfo(key, "12345555553");
  const actual = data.errors.length === 2;
  const expected = true;
  t.is(actual, expected, msg);
});

// test.only("--------------> dev", async t => {
//   const returnData = await ytAPI.getVideoInfo(key, video);
//   await touch("./test/dev.json", JSON.stringify(returnData, null, 2), {
//     overwrite: true
//   });
//   console.log("written data to ./test/dev.json");
//   t.deepEqual(1, 1);
// });
