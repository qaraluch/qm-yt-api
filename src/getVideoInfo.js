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

// Data structure of dataObject:
// - property videoInfo: [errData, reqData, resData]
const processVideoData = dataObject => {
  // let errInfos; //TODO: implement err mgmt
  const videoInfo = dataObject.videoInfo;
  const pullVidioInfo = obj => ({
    id: obj.id,
    title: obj.snippet.title
  });
  const processVideoInfo = videoInfo[1].items.map(pullVidioInfo);
  return processVideoInfo[0]; // only 1 video
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
    }).then(addRawDataFromPlaylistInfo);
    return endOptions.rawApiData ? allRawData : processVideoData(allRawData);
  } catch (error) {
    mainErr(error);
  }
};

export default getVideoInfo;
