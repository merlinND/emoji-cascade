'use strict';

var geometry = require('./geometry.js');
var trajectories = require('./trajectories.js');

/**
 * Representation of sprites
 */
var Sprite = function Sprite(x, y, z, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.width = width || 1;
  this.height = height || 1;
  this.uv = geometry.rectangleUV;
  this.trajectory = trajectories.noop();
};
Sprite.prototype.getVertices = function() {
  return geometry.rectangleVertices(this.x, this.y, this.z, this.width, this.height);
};
Sprite.prototype.animate = function(t, dt) {
  var xyz = this.trajectory(t, dt, this.x, this.y, this.z);
  this.x = xyz[0];
  this.y = xyz[1];
  this.z = xyz[2];
  return xyz;
};
// "Static" function
Sprite.fromSpritesheet = function(x, y, z, width, height, sheet, i, j) {
  var s = new Sprite(x, y, z, width, height);
  s.uv = sheet.getRectangleUVForSprite(i, j);
  return s;
};

module.exports = Sprite;
