'use strict';

var geometry = require('./geometry.js');
var texture = require('./texture.js');
var utils = require('./utils.js');
var Sprite = require('./sprite.js');
var spritesheet = require('./spritesheet.js');

/** Configuration and state */
var framerateCap = 30;
var animationEnabled = true;

var createSprites = function(gl, program, nx, ny, spacing, size, spritesheet) {
  var sprites = [];
  for (var i = 0; i < nx; ++i) {
    for (var j = 0; j < ny; ++j) {
      var x = (size + spacing) * i,
          y = (size + spacing) * j;

      sprites.push(Sprite.fromSpritesheet(x, y, size, size, spritesheet, i, j));
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
  }
}

var drawSprites = function(gl, sprites, vertexBuffer, uvBuffer) {
  for (var i in sprites) {
    var sprite = sprites[i];

    // Draw textured triangles
    var vertexCoordinates = sprite.getVertices();
    utils.fillBuffer(gl, vertexBuffer, vertexCoordinates);
    utils.fillBuffer(gl, uvBuffer, sprite.uv);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCoordinates.length / 2);
  }
}

var init = function(gl) {
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  window.addEventListener('keypress', function(e) {
    console.log(arguments);
    if (!e) return;

    if (e.keyCode && e.keyCode == 32) {
      animationEnabled = !animationEnabled;
      console.log(animationEnabled);
    }
  }, false);
}

var main = function() {
  var canvasId = 'canvas';
  var canvas = document.getElementById(canvasId);

  var gl = utils.getContext(canvasId);
  var program = utils.setupProgram(gl, '2d-vertex-shader', '2d-fragment-shader');
  init(gl);

  utils.setResolution(gl, program, canvasId);

  var texturePath = 'http://127.0.0.1:8000/textures/emoji_square.png';
  // var texturePath = 'http://127.0.0.1:8000/textures/doge.jpg';
  texture.load(gl, texturePath, [0, 0, 255, 255], function(image) {
    var sheet = spritesheet.createFromImage(image);

    var nRectanglesX = 30;
    var nRectanglesY = nRectanglesX;
    var spacing = - canvas.width / 150;
    var sprites = createSprites(gl, program, nRectanglesX, nRectanglesY, spacing, canvas.width / nRectanglesX, sheet);

    var vertexBuffer = utils.makeBuffer(gl, 2, gl.getAttribLocation(program, 'a_position'));
    var uvBuffer = utils.makeBuffer(gl, 2, gl.getAttribLocation(program, "a_texcoords"));

    var time;
    var draw = function() {
      // TODO: compute dt from actual elapsed time
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
