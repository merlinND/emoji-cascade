'use strict';

var geometry = require('./geometry.js');

/**
 * Representation of sprites
 */
var Sprite = function Sprite(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 1;
  this.height = height || 1;
  this.uv = geometry.rectangleUV;
}
Sprite.prototype.getVertices = function() {
  return geometry.rectangleVertices(this.x, this.y, this.width, this.height);
};
Sprite.fromSpritesheet = function(x, y, width, height, sheet, i, j) {
  var s = new Sprite(x, y, width, height);

  console.log(sheet);
  s.uv = sheet.getRectangleUVForSprite(i, j);
  return s;
}

module.exports = Sprite;
