'use strict';

var utils = require('./utils.js');

module.exports = {
  rectangleDrawer: function(vertexBuffer, uvBuffer) {
    return function(gl, x, y, width, height, uv) {
      var verticesCoordinates = [
        x,         y,
        x,         y + height,
        x + width, y,
        x + width, y + height,
        x        , y + height,
        x + width, y,
      ];

      uv = uv || [
        0, 0,
        0, 1,
        1, 0,
        1, 1,
        0, 1,
        1, 0,
      ];

      // Draw triangles
      utils.fillBuffer(gl, vertexBuffer, verticesCoordinates);
      utils.fillBuffer(gl, uvBuffer, uv);
      gl.drawArrays(gl.TRIANGLES, 0, verticesCoordinates.length / 2);
    }
  },
};
