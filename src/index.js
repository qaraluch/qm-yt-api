import google from "googleapis";

const returnYTapi = apiKey =>
  google.youtube({
    version: "v3",
    auth: apiKey
  });

const returnApiCB = (reject, resolve) => {
  return (err, data, response) => {
    var errData;
    var reqData;
    var resData;
    if (err) {
      errData = err;
    } else if (data) {
      reqData = data;
    } else if (response) {
      resData = "Status code: " + response.statusCode;
    }
    resolve([errData, reqData, resData]);
  };
};

const asyncGetVideosInfo = (apiKey, endApiOptions) => {
  return new Promise((resolve, reject) => {
    const ytAPI = returnYTapi(apiKey);
    // API info: https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.playlistItems.list
    return ytAPI.playlistItems.list(
      endApiOptions,
      returnApiCB(reject, resolve)
    );
  });
};

const asyncGetPlaylistInfo = (apiKey, endApiOptions) => {
  return new Promise((resolve, reject) => {
    const ytAPI = returnYTapi(apiKey);
    // API info: https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.playlists.list
    return ytAPI.playlists.list(endApiOptions, returnApiCB(reject, resolve));
  });
};

const margeOptions = (defaultOptions, passedOptions) =>
  Object.assign({}, defaultOptions, passedOptions);

const getDefaultOptionsForVideosInfo = (playlistId, nextPageToken) => {
  const apiOptions = {
    part: "snippet, contentDetails",
    maxResults: 50,
    playlistId
  };
  nextPageToken && (apiOptions.pageToken = nextPageToken);
  return apiOptions;
};

const getDefaultOptionsForPlayListInfo = playlistId => ({
  part: "snippet, contentDetails",
  maxResults: 50,
  id: playlistId
});

const mainErr = err => {
  throw new Error(
    `qm-yt-api - getVideosInfoFromPlaylist(): ${err.message} \n ${err.stack}`
  );
};

// Data structure of dataObject:
// - property playListInfo: [errData, reqData, resData]
// - property videosInfo: [ [errData, reqData, resData], ...[]]
const processData = dataObject => {
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
    return endOptions.rawApiData ? allRawData : processData(allRawData);
  } catch (error) {
    mainErr(error);
  }
};

const addRawDataFromPlaylistInfo = async res => {
  res.playListInfo = await asyncGetPlaylistInfo(
    res.apiKey,
    res.endApiOptionsForPlayListInfo
  );
  return res;
};

const getNextPageToken = apiResponse =>
  apiResponse[1] &&
  apiResponse[1].nextPageToken &&
  apiResponse[1].nextPageToken;

const getRawDataFromVideosInfo = async res => {
  const apiInfo = [];
  const endApiOptions = res.getEndApiOptionsForVideosInfo(res.playlistId);
  const nextEndApiOptions = nextPageToken =>
    res.getEndApiOptionsForVideosInfo(res.playlistId, nextPageToken);
  // next call depends on page token of beforehand call!
  async function recursionAPICall(endApiOptions) {
    const callAPI = await asyncGetVideosInfo(res.apiKey, endApiOptions);
    apiInfo.push(callAPI);
    const nextPageToken = getNextPageToken(callAPI);
    nextPageToken && (await recursionAPICall(nextEndApiOptions(nextPageToken)));
  }
  await recursionAPICall(endApiOptions);
  res.viedosInfo = apiInfo;
  return res;
};

const ytAPI = {
  getVideosInfoFromPlaylist
};

export default ytAPI;
