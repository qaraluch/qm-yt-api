import google from "googleapis";

const returnYTapi = apiKey =>
  google.youtube({
    version: "v3",
    auth: apiKey
  });

const returnApiCB = (reject, resolve) => {
  return (err, data, response) => {
    var reqData;
    if (err) {
      throw new Error(err);
    } else if (data) {
      reqData = data;
    } else if (response) {
      throw new Error(
        `YT API rejected request! Status code: ${response.statusCode}. 
        Check out an url: developers.google.com/youtube/v3/docs/errors`
      );
    }
    resolve(reqData);
  };
};

const callVideosInfo = (apiKey, endApiOptions) => {
  return new Promise((resolve, reject) => {
    const ytAPI = returnYTapi(apiKey);
    // API info: https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.playlistItems.list
    return ytAPI.playlistItems.list(
      endApiOptions,
      returnApiCB(reject, resolve)
    );
  });
};

const callVideoInfo = (apiKey, endApiOptions) => {
  return new Promise((resolve, reject) => {
    const ytAPI = returnYTapi(apiKey);
    // API info: https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videos.list
    return ytAPI.videos.list(endApiOptions, returnApiCB(reject, resolve));
  });
};

const callPlaylistInfo = (apiKey, endApiOptions) => {
  return new Promise((resolve, reject) => {
    const ytAPI = returnYTapi(apiKey);
    // API info: https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.playlists.list
    return ytAPI.playlists.list(endApiOptions, returnApiCB(reject, resolve));
  });
};

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

const getDefaultOptionsForVideoInfo = videoId => ({
  part: "snippet, contentDetails",
  id: videoId
});

const getNextPageToken = apiResponse =>
  apiResponse[1] &&
  apiResponse[1].nextPageToken &&
  apiResponse[1].nextPageToken;

export {
  callPlaylistInfo,
  callVideosInfo,
  callVideoInfo,
  getDefaultOptionsForPlayListInfo,
  getDefaultOptionsForVideosInfo,
  getDefaultOptionsForVideoInfo,
  getNextPageToken
};
