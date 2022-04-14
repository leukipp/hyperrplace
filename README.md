# Hyperrplace
Explore the Reddit [r/place](https://www.reddit.com/r/place) 2017 - 2022 canvas history in 4 dimensions.

## Online
➡️ **https://leukipp.com/hyperrplace**

## Status
In order to implement this on a static website ([GitHub Pages](https://leukipp.com/hyperrplace)), some technical challenges need to be addressed:
- [x] Store the entire history based on the publicly available data ([990MB](https://storage.googleapis.com/place_data_share/place_tiles.csv), [20GB)](https://placedata.reddit.com/data/canvas-history/2022_place_canvas_history.csv.gzip) on GitHub.
  - Starting from a more compact version ([available here](https://www.kaggle.com/datasets/leukipp/reddit-place-canvas)) the data was uploaded in chunks as zipped json files.
- [x] Load the entire history into browser memory to allow rapid back and forth navigation.
  - The zipped files are loaded via a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) process in the background and passed to the UI thread.
- [ ] Render more than 4 million (2000 * 2000) voxels in real time.
  - A fast rendering process via [three.js](https://threejs.org) requires the position/color of each voxel to be stored. This is very memory intense and causes browser crashes if the hardware in use is insufficient.

Once the rendering problem has been properly solved, the Z dimension would be a history representation through stacked voxels.

## License
[MIT](/LICENSE)