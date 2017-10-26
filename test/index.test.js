import test from "ava";
import ytAPI from "../dist/index.js";
import credentials from "../test/.key.json";
import touch from "qm-fs-touch";

// Tests are made against real YT data!
const key = credentials.key;
const playlist = credentials.playlist;
const playlistLong = credentials.playlistLong;
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

test("getVideosInfoFromPlaylist() - constructor function check", t => {
  const msg = "should be a function i.e. construction fn.";
  const actual = typeof ytAPI.getVideosInfoFromPlaylist === "function";
  const expected = true;
  t.is(actual, expected, msg);
});

test("getVideosInfoFromPlaylist() - return promise istance", t => {
  const msg = "should return promise istance";
  const actual = ytAPI.getVideosInfoFromPlaylist() instanceof Promise;
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
      title:
        "This Is Water - Full version-David Foster Wallace Commencement Speech"
    },
    {
      position: 1,
      id: "RnGvWTRQ9j4",
      title: "Everyday Virtue | Paterson & David Foster Wallace"
    }
  ]
};

test("getVideosInfoFromPlaylist() - get videos info from YT playlist", async t => {
  const msg = "should get videos info from YT playlist";
  const actual = await ytAPI.getVideosInfoFromPlaylist(key, playlist);
  delete actual.askDate;
  const expected = expectedInfoFromPlaylis;
  t.deepEqual(actual, expected, msg);
});

test("getVideosInfoFromPlaylist() - get raw YT Api data", async t => {
  const msg = "should get raw YT Api data";
  const actual = await ytAPI.getVideosInfoFromPlaylist(key, playlist, {
    rawApiData: true
  });
  const expected = "youtube#playlistListResponse";
  t.deepEqual(actual.playListInfo[1].kind, expected, msg);
});

test("getVideosInfoFromPlaylist() - get videos info from **flong** YT playlist", async t => {
  const msg = "should get videos count from long YT playlist (60)";
  // check if correct -> https://www.youtube.com/playlist?list=PLwJS-G75vM7kFO-yUkyNphxSIdbi_1NKX
  const data = await ytAPI.getVideosInfoFromPlaylist(key, playlistLong);
  const actual = data && data.videos.length;
  const expected = 60;
  t.deepEqual(actual, expected, msg);
});

// test.only("--------------> dev", async t => {
//   const returnData = await ytAPI.getVideosInfoFromPlaylist(key, playlistLong);
//   await touch("./test/dev.json", JSON.stringify(returnData, null, 2), {
//     overwrite: true
//   });
//   console.log("written data to ./test/dev.json");
//   t.deepEqual(1, 1);
// });
