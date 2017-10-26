import test from "ava";
import ytAPI from "../dist/index.js";
import credentials from "../test/.key.json";
import touch from "qm-fs-touch";

const key = credentials.key;
const playlist = credentials.playlistLong;

test.skip("check credentials", t => {
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

test.skip("Save porcessed YT API data for reference", async t => {
  const data = await ytAPI.getVideosInfoFromPlaylist(key, playlist, {
    rawApiData: false
  });
  await touch("./test/dump-YTAPIdata.json", JSON.stringify(data, null, 2), {
    overwrite: true
  });
  t.deepEqual(1, 1);
});

test.skip("Save raw YT API data for reference", async t => {
  const data = await ytAPI.getVideosInfoFromPlaylist(key, playlist, {
    rawApiData: true
  });
  await touch("./test/dump-rawYTAPIdata.json", JSON.stringify(data, null, 2), {
    overwrite: true
  });
  t.deepEqual(1, 1);
});
