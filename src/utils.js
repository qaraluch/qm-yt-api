const margeOptions = (defaultOptions, passedOptions) =>
  Object.assign({}, defaultOptions, passedOptions);

const mainErr = err => {
  throw new Error(
    `qm-yt-api - getVideosInfoFromPlaylist(): ${err.message} \n ${err.stack}`
  );
};

export { margeOptions, mainErr };
