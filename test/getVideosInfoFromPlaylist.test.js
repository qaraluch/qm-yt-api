import test from "ava";
import ytAPI from "../dist/index.js";
import credentials from "../test/.key.json";

// Tests are made against real YT data!
const key = credentials.key;
const playlist = credentials.playlist;
const playlistLong = credentials.playlistLong;

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
  const actual = typeof ytAPI.getVideosInfoFromPlaylist === "function";
  const expected = true;
  t.is(actual, expected, msg);
});

test("return promise istance", t => {
  const msg = "should return promise istance";
  const actual = ytAPI.getVideosInfoFromPlaylist(key) instanceof Promise;
  const expected = true;
  t.is(actual, expected, msg);
});

const expectedInfoFromPlaylis = {
  playlisName: "xxx-api-test",
  playlistId: "PL14-o1976FEZbkTr9dDiDcDDUbMftdMjz",
  itemsNumber: 2,
  videos: [
    {
      position: 0,
      id: "8CrOL-ydFMI",
      publishedAt: "2017-10-21T16:44:15.000Z",
      title:
        "This Is Water - Full version-David Foster Wallace Commencement Speech"
    },
    {
      position: 1,
      id: "RnGvWTRQ9j4",
      publishedAt: "2017-10-21T16:44:59.000Z",
      title: "Everyday Virtue | Paterson & David Foster Wallace"
    }
  ]
};

test("get videos info from YT playlist", async t => {
  const msg = "should get videos info from YT playlist";
  const actual = await ytAPI.getVideosInfoFromPlaylist(key, playlist);
  delete actual.askDate;
  delete actual.errors;
  const expected = expectedInfoFromPlaylis;
  t.deepEqual(actual, expected, msg);
});

test("bubble up API request errors", async t => {
  const msg = "should get video info";
  const data = await ytAPI.getVideosInfoFromPlaylist(key, playlist);
  const actual = data.errors.length === 4;
  const expected = true;
  t.is(actual, expected, msg);
});

//TODOC: when id of video not found, error are thrown by YT API for
//       youtube.playlistItem request
test("wrong playlist Id", async t => {
  const msg =
    "should return array with null for videos property of returned object";
  const data = await ytAPI.getVideosInfoFromPlaylist(key, "12345555553");
  const actual = data.videos;
  const expected = [undefined];
  t.deepEqual(actual, expected, msg);
});

test("get raw YT Api data", async t => {
  const msg = "should get raw YT Api data";
  const actual = await ytAPI.getVideosInfoFromPlaylist(key, playlist, {
    rawApiData: true
  });
  const expected = "youtube#playlistListResponse";
  t.is(actual.playListInfo[1].kind, expected, msg);
});

test("get videos info from **flong** YT playlist", async t => {
  const msg = "should get videos count from long YT playlist (60)";
  // check if correct -> https://www.youtube.com/playlist?list=PLwJS-G75vM7kFO-yUkyNphxSIdbi_1NKX
  const data = await ytAPI.getVideosInfoFromPlaylist(key, playlistLong);
  const actual = data && data.videos.length;
  const expected = 60;
  t.is(actual, expected, msg);
});

test("throw error when no api key passed as argument", async t => {
  const msg = "should throw an error";
  const error = await t.throws(ytAPI.getVideosInfoFromPlaylist());
  t.is(
    error.message,
    "qm-yt-api - getVideosInfoFromPlaylist(): No passed YT api key to the method!",
    msg
  );
});

// import touch from "qm-fs-touch";
// test.only("--------------> dev", async t => {
//   const returnData = await ytAPI.getVideosInfoFromPlaylist(key, "adasdda");
//   await touch("./test/dev.json", JSON.stringify(returnData, null, 2), {
//     overwrite: true
//   });
//   console.log("written data to ./test/dev.json");
//   t.deepEqual(1, 1);
// });
