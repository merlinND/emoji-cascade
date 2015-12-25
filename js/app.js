'use strict';

var camera = require('./camera.js');
var geometry = require('./geometry.js');
var texture = require('./texture.js');
var utils = require('./utils.js');
var Sprite = require('./sprite.js');
var spritesheet = require('./spritesheet.js');

/** Configuration and state */
var framerateCap = 3;
var fieldOfView = 60;  // In degrees
var animationEnabled = true;

var createSprites = function(gl, program, nx, ny, spacing, size, spritesheet) {
  var sprites = [];
  for (var i = 0; i < nx; ++i) {
    for (var j = 0; j < ny; ++j) {
      var x = (size + spacing) * i,
          y = (size + spacing) * j;

      sprites.push(Sprite.fromSpritesheet(x, y, -350, size, size, spritesheet, i, j));
    }
  }

  return sprites;
}

var animateSprites = function(sprites, dt) {
  for (var i in sprites) {
    var sprite = sprites[i];

    // Apply some randome perturbation
    // TODO: more interesting animation
    sprite.x += dt * (Math.random() - 0.5) * 0.05;
    sprite.y += dt * (Math.random() - 0.5) * 0.05;
    sprite.z += dt * (Math.random() - 0.5) * 0.05;
  }
}

var drawSprites = function(gl, sprites, vertexBuffer, uvBuffer) {
  for (var i in sprites) {
    var sprite = sprites[i];

    // Draw textured triangles
    // TODO: collate into a single draw call
    var vertexCoordinates = sprite.getVertices();
    utils.fillBuffer(gl, vertexBuffer, vertexCoordinates);
    utils.fillBuffer(gl, uvBuffer, sprite.uv);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCoordinates.length / 3);
  }
}

var init = function(gl, program, canvas) {
  // gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  // Setup projection matrix
  // TODO: dynamic view
  var projectionMatrix = camera.makeCamera(canvas,
                                           (Math.PI * fieldOfView / 180),
                                           1, 2000);
  console.log(projectionMatrix);
  var matrixAttribute = gl.getUniformLocation(program, 'u_matrix');
  gl.uniformMatrix4fv(matrixAttribute, false, projectionMatrix);

  // Handle keyboard input
  window.addEventListener('keypress', function(e) {
    if (!e) return;

    if (e.keyCode && e.keyCode == 32) {
      animationEnabled = !animationEnabled;
    }
  }, false);
}

var main = function() {
  var canvasId = 'canvas';
  var canvas = document.getElementById(canvasId);
  var gl = utils.getContext(canvasId);
  var program = utils.setupProgram(gl, '2d-vertex-shader', '2d-fragment-shader');
  init(gl, program, canvas);

  utils.setResolution(gl, program, canvasId);

  var texturePath = 'http://127.0.0.1:8000/textures/emoji_square.png';
  // var texturePath = 'http://127.0.0.1:8000/textures/doge.jpg';
  texture.load(gl, texturePath, [0, 0, 255, 255], function(image) {
    var sheet = spritesheet.createFromImage(image);

    var nRectanglesX = 30;
    var nRectanglesY = nRectanglesX;
    var spacing = - canvas.width / 150;
    var sprites = createSprites(gl, program, nRectanglesX, nRectanglesY, spacing, canvas.width / nRectanglesX, sheet);

    var vertexBuffer = utils.makeBuffer(gl, 3, gl.getAttribLocation(program, 'a_position'));
    var uvBuffer = utils.makeBuffer(gl, 2, gl.getAttribLocation(program, "a_texcoords"));

    var time;
    var draw = function() {
      // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      var now = new Date().getTime();
      var dt = now - (time || now);
      time = now;

      if (animationEnabled) {
        animateSprites(sprites, dt);
        drawSprites(gl, sprites, vertexBuffer, uvBuffer);
      }
      // Wait for a bit before requesting the next frame
      setTimeout(function() {
        window.requestAnimationFrame(draw);
      }, 1000 / framerateCap);
    }

    window.requestAnimationFrame(draw);
  });
}

main();
