'use strict';

// TODO: loader pre-screen (texture is quite large and slow to load)

var camera = require('./camera.js');
var texture = require('./texture.js');
var utils = require('./utils.js');
var Sprite = require('./sprite.js');
var spritesheet = require('./spritesheet.js');
var trajectories = require('./trajectories.js');

/** Configuration and state */
var framerateCap = 30;
var fieldOfView = 70;  // In degrees
var nearPlane = 1;
var farPlane = 2000;
var animationEnabled = true;
var startTime;  // Value of the time (ms) when animation started
var jitter = true;  // Whether to add small perturbations in initial emoji placement
var pathPrefix = 'textures/'; // http://127.0.0.1:8000/textures
var textures = [
  {
    path: pathPrefix + 'sheet_apple_16.png',
    size: 16
  },
  {
    path: pathPrefix + 'sheet_apple_32.png',
    size: 32
  },
  {
    path: pathPrefix + 'doge.jpg',
    size: 512
  },
];

var trajectoryOptions = {
  maxPeriod: 3000,
  maxWidth: 200,
  maxDepth: -2000,
  spiral: function() {
    return {
      period: 5000,
      depth: -2000,
      width: (this.maxWidth - 100) * Math.random() + 100,
      // Will be overriden for each sprite
      phase: 2 * Math.PI * Math.random(),
      timeshift: this.maxPeriod * Math.random()
    };
  },
  cascade: function() {
    return {
      speedOffset: 0.40
    };
  }
};
var trajectoryFactories = [
  function(options) {
    return trajectories.spiral(options.spiral());
  },
  function(options) {
    return trajectories.cascade(options.cascade());
  },
  // function(options) {
  //   return trajectories.noop();
  // },
  // function(options) {
  //   return trajectories.straightAhead(options.maxPeriod, options.maxDepth);
  // },
];
var currentTrajectory = 0;

var updateTrajectories = function(sprites, newTrajectory) {
  newTrajectory = newTrajectory || trajectoryFactories[currentTrajectory];

  for (var i in sprites) {
    var s = sprites[i];
    s.trajectory = newTrajectory(trajectoryOptions);
  }
};

var createSprites = function(gl, program, nx, ny, spacing, size, spritesheet) {
  var sprites = [];

  for (var i = 0; i < nx; i += 1) {
    for (var j = 0; j < ny; j += 1) {
      var x = (size + spacing) * i - (0.5 * size * nx);
      var y = (size + spacing) * j - (0.5 * size * ny);
      var z = trajectoryOptions.maxDepth + 1;
      if (jitter) {
        x += 10 * spacing * (Math.random() - 0.5);
        y += 10 * spacing * (Math.random() - 0.5);
        z += 10 * spacing * (Math.random() - 0.5);
      }

      var s = Sprite.fromSpritesheet(x, y, z, size, size,
                                     spritesheet, i, j);

      sprites.push(s);
    }
  }

  updateTrajectories(sprites);

  return sprites;
};

var animateSprites = function(sprites, t, dt) {
  for (var i in sprites) {
    sprites[i].animate(t, dt);
  }
};

var drawSprites = function(gl, sprites, vertexBuffer, uvBuffer) {
  // Sort by z order before drawing so that transparency works as expected
  // TODO: better / faster way?
  sprites.sort(function(a, b) {
    if (a.z < b.z) { return -1; }
    else if (a.z === b.z) { return 0; }
    return 1;
  });

  // Preallocate the buffers, then fill them in chunks
  // (one buffer after the other, to benefit from locality).
  var floatSize = 4;
  var nPrimitives = sprites.length * 6;
  var offset = 0;
  var i;

  // ----- Vertex coordinates
  // Allocate enough space for the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 3 * floatSize * nPrimitives, gl.STATIC_DRAW);
  for (i in sprites) {
    var vertices = sprites[i].getVertices();
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(vertices));
    offset += floatSize * vertices.length;
  }
  // ----- UV coordinates
  offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 2 * floatSize * nPrimitives, gl.STATIC_DRAW);
  for (i in sprites) {
    var uvs = sprites[i].uv;
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(uvs));
    offset += floatSize * uvs.length;
  }
  gl.drawArrays(gl.TRIANGLES, 0, nPrimitives);
};

var init = function(gl, program, canvas) {
  // gl.enable(gl.DEPTH_TEST);
  // gl.enable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  // Setup projection matrix
  var projectionMatrix = camera.makeCamera(canvas,
                                           (Math.PI * fieldOfView / 180),
                                           nearPlane, farPlane);
  var matrixAttribute = gl.getUniformLocation(program, 'u_matrix');
  gl.uniformMatrix4fv(matrixAttribute, false, projectionMatrix);

  // Handle keyboard input
  window.addEventListener('keypress', function(e) {
    if (!e) {
      return;
    }

    if (e.keyCode && e.keyCode === 32) {
      animationEnabled = !animationEnabled;
    }
  }, false);
};

var main = function() {
  var canvasId = 'canvas';
  var canvas = document.getElementById(canvasId);
  var gl = utils.getContext(canvasId);
  var program = utils.setupProgram(gl, '2d-vertex-shader', '2d-fragment-shader');
  init(gl, program, canvas);

  var tex = textures[0];
  texture.load(gl, tex.path, [0, 0, 255, 255], function(image, originalWidth, originalHeight) {
    var sheet = spritesheet.createFromImage(image, originalWidth, originalHeight, tex.size);

    var nRectanglesX = 30;
    var nRectanglesY = nRectanglesX;
    var spacing = canvas.width / 150;
    var sprites = createSprites(gl, program, nRectanglesX, nRectanglesY, spacing, canvas.width / nRectanglesX, sheet);

    var vertexBuffer = utils.makeBuffer(gl, 3, gl.getAttribLocation(program, 'a_position'));
    var uvBuffer = utils.makeBuffer(gl, 2, gl.getAttribLocation(program, "a_texcoords"));
    var matrixAttribute = gl.getUniformLocation(program, 'u_matrix');

    // On click, change the trajectories of the sprites to the next kind (also reset time)
    canvas.addEventListener('click', function() {
      currentTrajectory = (currentTrajectory + 1) % trajectoryFactories.length;
      updateTrajectories(sprites, trajectoryFactories[currentTrajectory]);
      startTime = new Date().getTime();
    });


    var time;
    startTime = new Date().getTime();
    var draw = function() {
      // Resize canvas to new window size if necessary
      var changed = utils.maximizeCanvas(gl);
      if (changed) {
        // Update the camera
        var projectionMatrix = camera.makeCamera(
            canvas, (Math.PI * fieldOfView / 180), nearPlane, farPlane);
        gl.uniformMatrix4fv(matrixAttribute, false, projectionMatrix);
      }

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      var now = new Date().getTime();
      var dt = now - (time || now);
      time = now;
      // Cap dt in case no frame was rendered for a while
      // (which happens when the browser window is not visible)
      dt = Math.min(dt, 100);

      if (animationEnabled) {
        animateSprites(sprites, time - startTime, dt);
        drawSprites(gl, sprites, vertexBuffer, uvBuffer);
      }
      // Wait for a bit before requesting the next frame
      setTimeout(function() {
        window.requestAnimationFrame(draw);
      }, 1000 / framerateCap);
    };

    // Start loading the high-res version (will be slower)
    // TODO: to avoid the black flash, load into another texture slot
    texture.load(gl, textures[1].path);

    window.requestAnimationFrame(draw);
  });
};

main();
