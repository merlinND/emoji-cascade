'use strict';

module.exports = {
  makeCamera: function(canvas, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return [
       2 / canvas.width, 0, 0, 0,
       0, -2 / canvas.height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  }
}
