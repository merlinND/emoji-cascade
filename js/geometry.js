'use strict';

var utils = require('./utils.js');

var rectangleVertices = function(x, y, width, height) {
  return [
    x,         y,
    x,         y + height,
    x + width, y,
    x + width, y + height,
    x        , y + height,
    x + width, y,
  ];
};

var rectangleUV = [
  0, 0,
  0, 1,
  1, 0,
  1, 1,
  0, 1,
  1, 0,
];

module.exports = {
  rectangleVertices: rectangleVertices,
  rectangleUV: rectangleUV,

  rectangleDrawer: function(vertexBuffer, uvBuffer) {
    return function(gl, x, y, width, height, uv) {
      var verticesCoordinates = rectangleVertices(x, y, width, height);

      uv = uv || rectangleUV;

      // Draw triangles
      utils.fillBuffer(gl, vertexBuffer, verticesCoordinates);
      utils.fillBuffer(gl, uvBuffer, uv);
      gl.drawArrays(gl.TRIANGLES, 0, verticesCoordinates.length / 2);
    }
  },
};
