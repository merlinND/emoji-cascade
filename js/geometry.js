'use strict';

var utils = require('./utils.js');

var rectangleVertices = function(x, y, z, width, height) {
  return [
    x,         y         , 0,
    x,         y + height, 0,
    x + width, y         , 0,
    x        , y + height, 0,
    x + width, y + height, 0,
    x + width, y         , 0,
  ];
};

var rectangleUV = [
  0, 0,
  0, 1,
  1, 0,
  0, 1,
  1, 1,
  1, 0,
];

module.exports = {
  rectangleVertices: rectangleVertices,
  rectangleUV: rectangleUV,

  rectangleDrawer: function(vertexBuffer, uvBuffer) {
    return function(gl, x, y, z, width, height, uv) {
      var verticesCoordinates = rectangleVertices(x, y, z, width, height);

      uv = uv || rectangleUV;

      // Draw triangles
      utils.fillBuffer(gl, vertexBuffer, verticesCoordinates);
      utils.fillBuffer(gl, uvBuffer, uv);
      gl.drawArrays(gl.TRIANGLES, 0, verticesCoordinates.length / 2);
    }
  },
};
