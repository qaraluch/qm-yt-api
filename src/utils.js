const margeOptions = (defaultOptions, passedOptions) =>
  Object.assign({}, defaultOptions, passedOptions);

const mainErr = (err, method) => {
  throw new Error(`qm-yt-api - ${method}: ${err.message}`);
};

const noApiKeyErr = () => {
  throw new Error("No passed YT api key to the method!");
};

const emptyResponseErr = () => {
  throw new Error("Returned empty response! Probably passed wrong video Id!");
};

export { margeOptions, mainErr, noApiKeyErr, emptyResponseErr };
