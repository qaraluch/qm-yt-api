import {
  margeOptions,
  mainErr,
  noApiKeyErr,
  emptyResponseErr
} from "../dist/utils.js";
import { callVideoInfo, getDefaultOptionsForVideoInfo } from "../dist/api.js";

const getEndApiOptionsVideoInfo = (videoId, apiOptions) =>
  margeOptions(getDefaultOptionsForVideoInfo(videoId), apiOptions);

const addRawDataFromPlaylistInfo = async res => {
  res.videoInfo = await callVideoInfo(
    res.apiKey,
    res.getEndApiOptionsVideoInfo(res.videoId, res.apiOptions)
  );
  return res;
};

// Data structure of dataObject:
const processVideoData = dataObject => {
  const video = dataObject.videoInfo.items[0]; // only 1 video
  const pulledVidioInfo = {
    id: video && video.id,
    title: video && video.snippet.title
  };
  return pulledVidioInfo;
};

const throwErrWhenNoResults = res => {
  const video = res.videoInfo.items[0]; // only 1 video
  video === undefined && emptyResponseErr("getVideoInfo()");
  return res;
};

const getVideoInfo = async (apiKey, videoId, options = {}, apiOptions = {}) => {
  const defaultOptions = {
    rawApiData: false
  };
  const endOptions = Object.assign({}, defaultOptions, options);

  try {
    apiKey || noApiKeyErr("getVideoInfo()");
    // get info from yt api
    let allRawData = await Promise.resolve({
      apiOptions,
      videoId,
      apiKey,
      getEndApiOptionsVideoInfo
    })
      .then(addRawDataFromPlaylistInfo)
      .then(throwErrWhenNoResults) // in videoInfo.items
      .catch(err => {
        throw err;
      });
    return endOptions.rawApiData ? allRawData : processVideoData(allRawData);
  } catch (error) {
    mainErr(error, "getVideoInfo()");
  }
};

export default getVideoInfo;
