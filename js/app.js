'use strict';

var geometry = require('./geometry.js');
var texture = require('./texture.js');
var utils = require('./utils.js');

var drawRectangleGrid = function(gl, program, nx, ny, spacing, size, spritesheet) {
  var vertexBuffer = utils.makeBuffer(gl, 2, gl.getAttribLocation(program, 'a_position'));

  var uvBuffer = utils.makeBuffer(gl, 2, gl.getAttribLocation(program, "a_texcoords"));

  var draw = geometry.rectangleDrawer(vertexBuffer, uvBuffer);
  var uv = null;

  for (var i = 0; i < nx; ++i) {
    for (var j = 0; j < ny; ++j) {
      var color = [Math.random(), Math.random(), Math.random(), 1];
      var x = (size + spacing) * i,
          y = (size + spacing) * j;

      if (spritesheet) {
        uv = spritesheet.getRectangleUVForSprite(i, j);
      }

      utils.setColor(gl, program, color);
      draw(gl, x, y, size, size, uv);
    }
  }
}

var init = function(gl) {
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
}

var main = function() {
  var canvasId = 'canvas';
  var canvas = document.getElementById(canvasId);

  var gl = utils.getContext(canvasId);
  var program = utils.setupProgram(gl, '2d-vertex-shader', '2d-fragment-shader');
  init(gl);

  utils.setResolution(gl, program, canvasId);

  var draw = function(spritesheet) {
    var nRectanglesX = 30;
    var nRectanglesY = nRectanglesX;
    var spacing = - canvas.width / 100;
    drawRectangleGrid(gl, program, nRectanglesX, nRectanglesY, spacing, canvas.width / nRectanglesX, spritesheet);
  }

  draw();

  var texturePath = 'http://127.0.0.1:8000/textures/emoji_square.png';
  // var texturePath = 'http://127.0.0.1:8000/textures/doge.jpg';
  texture.load(gl, texturePath, [0, 0, 255, 255], draw);
}

main();
