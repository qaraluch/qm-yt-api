import { margeOptions, mainErr } from "../dist/utils.js";
import {
  callPlaylistInfo,
  callVideosInfo,
  getDefaultOptionsForPlayListInfo,
  getDefaultOptionsForVideosInfo,
  getNextPageToken
} from "../dist/api.js";

// Data structure of dataObject:
// - property playListInfo: [errData, reqData, resData]
// - property videosInfo: [ [errData, reqData, resData], ...[]]
const processVideosData = dataObject => {
  // let errInfos; //TODO: implement err mgmt
  const playListInfo = dataObject.playListInfo[1];
  const playlistId = dataObject.playlistId;
  const videosInfo = dataObject.viedosInfo;
  const errors = dataObject.errors;
  const pullVidiosInfo = obj => ({
    position: obj.snippet.position,
    id: obj.contentDetails.videoId,
    title: obj.snippet.title,
    publishedAt: obj.snippet.publishedAt
  });
  const processVideosInfo = videosInfo.map(
    arr => arr[1] && arr[1].items.map(pullVidiosInfo)
  );
  const now = new Date();
  const dataProcessed = {
    askDate: now.toString(),
    playlisName: playListInfo && playListInfo.items[0].snippet.title,
    playlistId,
    itemsNumber: playListInfo && playListInfo.items[0].contentDetails.itemCount,
    videos: [].concat(...processVideosInfo),
    errors
  };
  return dataProcessed;
};

function bubbleUpApiErrors(res) {
  const plReqErr = res.playListInfo[0];
  const plResErr = res.playListInfo[2];
  const viReqErr = res.viedosInfo.map(r => r[0]);
  const viResErr = res.viedosInfo.map(r => r[2]);
  //TODOC: error sequence
  res.errors = [];
  res.errors.push(plReqErr);
  res.errors.push(plResErr);
  res.errors.push(viReqErr);
  res.errors.push(viResErr);
  return res;
}

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
    //TODOC: module options
    rawApiData: false
  };
  const endOptions = Object.assign({}, defaultOptions, options);

  try {
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
      .then(bubbleUpApiErrors);
    return endOptions.rawApiData ? allRawData : processVideosData(allRawData);
  } catch (error) {
    mainErr(error);
  }
};

export default getVideosInfoFromPlaylist;
