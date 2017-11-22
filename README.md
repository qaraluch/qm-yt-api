![logo-qm](./pic/logo-qm.jpg)

# qm-yt-api [![npm version](https://badge.fury.io/js/qm-yt-api.svg)](https://badge.fury.io/js/qm-yt-api) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

>  Simple wrapper of youtube api for getting info about videos also ones in playlist.   


## Installation
```sh
$ npm i -S qm-yt-api
```


## Usage
All module's functions returns promise object.
```js
import ytAPI from "qm-yt-api";

// ...

const videoInfo = await ytAPI.getVideoInfo(key, videoId);
// => 
// {
//   id: "8CrOL-ydFMI",
//   title: "This Is Water ... "
//   errors: [...]
// }

// or 
const videos = await ytAPI.getVideosInfoFromPlaylist(key, playlistId);
// =>
// {
//   playlistName: "...",
//   playlistId: "PL14-...",
//   itemsNumber: 2,
//   askDate": "Tue Oct 31 2017 09:19:50 GMT+0100 (STD)",
//   videos: [
//     {
//       position: 0,
//       id: "8CrOL-ydFMI",
//       publishedAt: "2017-10-21T16:44:15.000Z",
//       title:
//         "This Is Water ..."
//     },
//     {
//       position: 1,
//       id: "RnGvWTRQ9j4",
//       publishedAt: "2017-10-21T16:44:59.000Z",
//       title: "Everyday Virtue..."
//     }
//   ],
//  errors: []
// };
```

## Options
There's possibility to get raw youtube api response. All you need is set additional option:
```js
const options = { rawApiData: true }; //default: false
const videoInfo = await ytAPI.getVideoInfo(apiKey, videoId, options, apiOptions)
```

You can modify api request by passing `apiOptions` argument. Default used are:

```js
const apiOptions = {
  part: "snippet, contentDetails",
}
```

See additional options in
 Google [documentation](https://developers.google.com/youtube/v3/docs/videos/list).

## Tests
Tests are made against real YT data, so for performing testing you need working google apikey and put it to `./test/key.json` file.
Use `.key-tmeplate.json` as reference. 

## Limitations
Due to access via api key getting private video information is limitted.

## Credits
* [google-api-nodejs-client](https://github.com/google/google-api-nodejs-client)

## License
MIT © [qaraluch](https://github.com/qaraluch)

