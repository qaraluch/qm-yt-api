import { margeOptions, mainErr, noApiKeyErr } from "../dist/utils.js";
import {
  callPlaylistInfo,
  callVideosInfo,
  getDefaultOptionsForPlayListInfo,
  getDefaultOptionsForVideosInfo,
  getNextPageToken
} from "../dist/api.js";

// Data structure of dataObject:
// - property playListInfo: reqData
// - property videosInfo: [ reqData, ...[]] for every 50 items in PL
const processVideosData = dataObject => {
  const playListInfo = dataObject.playListInfo;
  const playlistId = dataObject.playlistId;
  const videosInfo = dataObject.viedosInfo;
  const pullVidiosInfo = obj => ({
    position: obj.snippet.position,
    id: obj.contentDetails.videoId,
    title: obj.snippet.title,
    publishedAt: obj.snippet.publishedAt
  });
  const processVideosInfo = videosInfo.map(
    arr => arr && arr.items.map(pullVidiosInfo)
  );
  const now = new Date();
  const dataProcessed = {
    askDate: now.toString(),
    playlistName: playListInfo.items[0] && playListInfo.items[0].snippet.title,
    playlistId,
    itemsNumber:
      playListInfo.items[0] && playListInfo.items[0].contentDetails.itemCount,
    videos: [].concat(...processVideosInfo)
  };
  return dataProcessed;
};

const getEndApiOptionsForPlayListInfo = (playlistId, apiOptions) =>
  margeOptions(getDefaultOptionsForPlayListInfo(playlistId), apiOptions);

const addRawDataFromPlaylistInfo = async res => {
  res.playListInfo = await callPlaylistInfo(
    res.apiKey,
    res.getEndApiOptionsForPlayListInfo(res.playlistId, res.apiOptions)
  );
  return res;
};

const getEndApiOptionsForVideosInfo = (playlistId, apiOptions, nextPageToken) =>
  margeOptions(
    getDefaultOptionsForVideosInfo(playlistId, nextPageToken),
    apiOptions
  );

const getRawDataFromVideosInfo = async res => {
  const apiInfo = [];
  const endApiOptions = res.getEndApiOptionsForVideosInfo(res.playlistId);
  const nextEndApiOptions = nextPageToken =>
    res.getEndApiOptionsForVideosInfo(
      res.playlistId,
      res.apiOptions,
      nextPageToken
    );
  // next call depends on page token of beforehand call!
  async function recursionAPICall(endApiOptions) {
    const callAPI = await callVideosInfo(res.apiKey, endApiOptions);
    apiInfo.push(callAPI);
    const nextPageToken = getNextPageToken(callAPI);
    nextPageToken && (await recursionAPICall(nextEndApiOptions(nextPageToken)));
  }
  await recursionAPICall(endApiOptions);
  res.viedosInfo = apiInfo;
  return res;
};

const getVideosInfoFromPlaylist = async (
  apiKey,
  playlistId,
  options = {},
  apiOptions = {}
) => {
  const defaultOptions = {
    rawApiData: false
  };
  const endOptions = Object.assign({}, defaultOptions, options);

  try {
    apiKey || noApiKeyErr("getVideosInfoFromPlaylist()");
    // get info from yt api
    let allRawData = await Promise.resolve({
      apiOptions,
      playlistId,
      apiKey,
      getEndApiOptionsForPlayListInfo,
      getEndApiOptionsForVideosInfo
    })
      .then(addRawDataFromPlaylistInfo)
      .then(getRawDataFromVideosInfo)
      .catch(err => {
        throw new Error(err);
      });

    // console.log("allRawData ", allRawData);

    return endOptions.rawApiData ? allRawData : processVideosData(allRawData);
  } catch (error) {
    mainErr(error, "getVideosInfoFromPlaylist()");
  }
};

export default getVideosInfoFromPlaylist;
