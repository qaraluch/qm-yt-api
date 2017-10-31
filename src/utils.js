const margeOptions = (defaultOptions, passedOptions) =>
  Object.assign({}, defaultOptions, passedOptions);

const mainErr = (err, method) => {
  throw new Error(`qm-yt-api - ${method}: ${err.message} \n ${err.stack}`);
};

export { margeOptions, mainErr };
