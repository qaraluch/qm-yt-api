const margeOptions = (defaultOptions, passedOptions) =>
  Object.assign({}, defaultOptions, passedOptions);

const mainErr = (err, method) => {
  throw new Error(`qm-yt-api - ${method}: ${err.message} \n ${err.stack}`);
};

const noApiKeyErr = method => {
  throw new Error(`qm-yt-api - ${method}: No passed YT api key to the method!`);
};

export { margeOptions, mainErr, noApiKeyErr };
