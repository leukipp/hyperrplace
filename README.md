# Hyperrplace
Explore the Reddit [r/place](https://www.reddit.com/r/place) 2017 - 2022 canvas history in 3D.

## Online [![browser](https://img.shields.io/badge/browser-gray?logo=googlechrome&logoColor=white)](#Online) [![status](https://img.shields.io/badge/status-up-brightgreen)](#Online)
An online version can be found [here](https://leukipp.com/hyperrplace).
[![app](/img/app.png)](https://leukipp.com/hyperrplace)

## Status [![github](https://img.shields.io/badge/github-gray?logo=github&logoColor=white)](#Status) [![html](https://img.shields.io/badge/javascript-gray?logo=javascript)](#Status)
In order to implement this on a static website ([GitHub Pages](https://leukipp.com/hyperrplace)), some technical challenges need to be addressed:
- [x] Store the entire history based on the publicly available data ([990MB](https://storage.googleapis.com/place_data_share/place_tiles.csv), [20GB)](https://placedata.reddit.com/data/canvas-history/2022_place_canvas_history.csv.gzip) on GitHub.
  - Starting from a more compact version ([available here](https://www.kaggle.com/datasets/leukipp/reddit-place-canvas)) the data was uploaded in chunks as zipped json files.
- [x] Load the entire history into browser memory to allow rapid back and forth navigation.
  - The zipped files are loaded in the background via [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) processes and passed to the UI thread.
- [ ] Render more than 4 million (2000 * 2000) voxels in real time.
  - A fast rendering process via [three.js](https://threejs.org) requires the position/color of each voxel to be stored. This is very memory intense and causes **browser crashes** if the hardware in use is insufficient.

Once the rendering problem has been properly solved, the Z dimension would be a history representation visualized through stacked voxels.

## License [![license](https://img.shields.io/badge/license-MIT-green)](#License)
[MIT](/LICENSE)
