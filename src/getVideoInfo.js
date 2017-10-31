import { margeOptions, mainErr } from "../dist/utils.js";
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

function bubbleUpApiErrors(res) {
  const reqErr = res.videoInfo[0];
  const resErr = res.videoInfo[2];
  res.errors = [];
  res.errors.push(reqErr);
  res.errors.push(resErr);
  return res;
}

// Data structure of dataObject:
// - property videoInfo: [errData, reqData, resData]
const processVideoData = dataObject => {
  // let errInfos; //TODO: implement err mgmt
  const video = dataObject.videoInfo[1].items[0]; //TODOC: only 1 video
  const errors = dataObject.errors;
  const pulledVidioInfo = {
    id: video && video.id,
    title: video && video.snippet.title,
    errors
  };
  return pulledVidioInfo;
};

const getVideoInfo = async (apiKey, videoId, options = {}, apiOptions = {}) => {
  const defaultOptions = {
    //TODOC: module options
    rawApiData: false
  };
  const endOptions = Object.assign({}, defaultOptions, options);

  try {
    // get info from yt api
    let allRawData = await Promise.resolve({
      apiOptions,
      videoId,
      apiKey,
      getEndApiOptionsVideoInfo
    })
      .then(addRawDataFromPlaylistInfo)
      .then(bubbleUpApiErrors)
      .catch(err => {
        throw new Error(err);
      });
    return endOptions.rawApiData ? allRawData : processVideoData(allRawData);
  } catch (error) {
    mainErr(error, "getVideoInfo()");
  }
};

export default getVideoInfo;
