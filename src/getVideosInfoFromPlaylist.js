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
    videos: [].concat(...processVideosInfo)
  };
  return dataProcessed;
};

const addRawDataFromPlaylistInfo = async res => {
  res.playListInfo = await callPlaylistInfo(
    res.apiKey,
    res.endApiOptionsForPlayListInfo
  );
  return res;
};

const getRawDataFromVideosInfo = async res => {
  const apiInfo = [];
  const endApiOptions = res.getEndApiOptionsForVideosInfo(res.playlistId);
  const nextEndApiOptions = nextPageToken =>
    res.getEndApiOptionsForVideosInfo(res.playlistId, nextPageToken);
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

  const getEndApiOptionsForVideosInfo = (playlistId, nextPageToken) => {
    return margeOptions(
      getDefaultOptionsForVideosInfo(playlistId, nextPageToken),
      apiOptions
    );
  };

  const endApiOptionsForPlayListInfo = margeOptions(
    getDefaultOptionsForPlayListInfo(playlistId),
    apiOptions
  );

  try {
    // get info from yt api
    let allRawData = await Promise.resolve({
      playlistId,
      apiKey,
      endApiOptionsForPlayListInfo,
      getEndApiOptionsForVideosInfo
    })
      .then(addRawDataFromPlaylistInfo)
      .then(getRawDataFromVideosInfo);
    return endOptions.rawApiData ? allRawData : processVideosData(allRawData);
  } catch (error) {
    mainErr(error);
  }
};

export default getVideosInfoFromPlaylist;
