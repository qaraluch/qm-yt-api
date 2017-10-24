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

const getDefaultOptionsForVideosInfo = playlistId => ({
  part: "snippet, contentDetails",
  playlistId
});

const getDefaultOptionsForPlayListInfo = playlistId => ({
  part: "snippet, contentDetails",
  id: playlistId
});

const mainErr = err => {
  throw new Error(`qm-yt-api - getVideosInfoFromPlaylist(): ${err.message}`);
};

// Data structure:
// playListInfo [errData, reqData, resData]
// videosInfo [errData, reqData, resData]
const processYTdata = (playlistId, playListInfo, videosInfo) => {
  // let errInfos; //TODO: implement err mgmt
  const pullVidiosInfo = obj => ({
    position: obj.snippet.position,
    id: obj.contentDetails.videoId,
    title: obj.snippet.title
  });
  const dataProcessed = {
    playlisName: playListInfo[1] && playListInfo[1].items[0].snippet.title,
    playlistId,
    itemsNumber:
      playListInfo[1] && playListInfo[1].items[0].contentDetails.itemCount,
    videos: videosInfo[1] && videosInfo[1].items.map(pullVidiosInfo)
  };
  return dataProcessed;
};

const getVideosInfoFromPlaylist = async (
  apiKey,
  playlistId,
  apiOptions = {}
) => {
  const endApiOptionsForVideosInfo = margeOptions(
    getDefaultOptionsForVideosInfo(playlistId),
    apiOptions
  );
  const endApiOptionsForPlayListInfo = margeOptions(
    getDefaultOptionsForPlayListInfo(playlistId),
    apiOptions
  );
  try {
    // get info from yt api
    // TODO: concurrent for better performance ?
    const playListInfo = await asyncGetPlaylistInfo(
      apiKey,
      endApiOptionsForPlayListInfo
    );
    const videosInfo = await asyncGetVideosInfo(
      apiKey,
      endApiOptionsForVideosInfo
    );

    // return [playListInfo, videosInfo]; //TODO: raw data from YT API - add flag
    // console.log("videosInfo[1] ", videosInfo);

    // process info
    return processYTdata(playlistId, playListInfo, videosInfo);
  } catch (error) {
    mainErr(error);
  }
};

const ytAPI = {
  getVideosInfoFromPlaylist
};

export default ytAPI;
