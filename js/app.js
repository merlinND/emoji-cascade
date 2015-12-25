'use strict';
// TODO: modularize and refactor code

/**
 * Data structure representing the spritesheet.
 * Each sprite has a fixed square size.
 */
// TODO: mechanism to exclude specific sprites
var newSpritesheet = function(image) {
  var w = 21;
  var h = 21;
  return {
    width: w,
    height: h,
    sheetWidth: image.width,
    sheetHeight: image.height,

    nx: Math.floor(image.width / w),
    ny: Math.floor(image.height / h),

    /**
     * Get UV coordinates for the sprite at position (i, j).
     * Boundary conditions are applied to the (i, j) coordinates passed.
     */
    getSpriteUV: function(i, j) {
      i = (i % this.ny);
      j = (j % this.nx);

      return [i / this.ny, j / this.nx];
    },

    getRectangleUVForSprite: function(i, j) {
      // Compute UV coordinates corresponding to the particular sprite
      var corner = this.getSpriteUV(i, j);
      var x0 = corner[0], y0 = corner[1],
          x1 = x0 + (this.width / this.sheetWidth),
          y1 = y0 + (this.height / this.sheetHeight);

      return [
        x0, y0,
        x0, y1,
        x1, y0,
        x1, y1,
        x0, y1,
        x1, y0
      ];
    }
  }
}

/** Get the WebGL context from the `canvas` element */
var getContext = function(canvasId) {
  var canvas = document.getElementById(canvasId);
  return canvas.getContext('experimental-webgl');
}

var setupProgram = function(gl, vertexShader, fragmentShader) {
  var program = createProgramFromScripts(gl, [vertexShader, fragmentShader]);
  gl.useProgram(program);
  return program;
}

var setResolution = function(gl, program, canvasId) {
  var canvas = document.getElementById(canvasId);

  var resolutionAttribute = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(resolutionAttribute, canvas.width, canvas.height);
}

var setColor = function(gl, program, color) {
  var colorAttribute = gl.getUniformLocation(program, 'u_color');
  gl.uniform4fv(colorAttribute, color);
}

var loadTextureAsync = function(gl, path, placeholderColor, cb) {
  // Create a texture
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Fill the texture with a solid color while waiting for the image to load
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array(placeholderColor));
  // Asynchronously load an image
  var image = new Image();
  image.src = path;
  image.addEventListener('load', function() {
    var spritesheet = newSpritesheet(image);

    // Now that the image has loaded copy it to the texture
    console.log("Successfully loaded texture from: " + path + " (" + image.width + " x " + image.height + ")");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

    // TODO: make image size a power of 2 so that we can geretate mipmaps
    var isPowerOf2 = function(n) { return (n & (n - 1)) == 0; };
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      console.warn("Could not generate mipmaps for texture.");
    }

    requestAnimationFrame(function() {
      cb(spritesheet);
    });
  });
}

// Allocate and fill a GL buffer with vertices
var makeBufferForVertices = function(gl, attribute) {
  var nTriangles = 2;

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, nTriangles, gl.FLOAT, false, 0, 0);

  return buffer;
}
var fillRectangleBuffer = function(gl, buffer, coordinates) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(coordinates),
      gl.STATIC_DRAW
    );
}

// Allocate and fill a GL buffer for texture coordinates
var makeBufferForTextureCoordinates = function(gl, attribute) {
  var buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);

  return buffer;
}
var fillTextureCoordinatesBuffer = function(gl, buffer, coordinates) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(coordinates),
      gl.STATIC_DRAW
    );
}

var drawRectangle = function(vertexBuffer, uvBuffer) {
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
    fillRectangleBuffer(gl, vertexBuffer, verticesCoordinates);
    fillTextureCoordinatesBuffer(gl, uvBuffer, uv);
    gl.drawArrays(gl.TRIANGLES, 0, verticesCoordinates.length / 2);
  }
}

var drawRectangleGrid = function(gl, program, nx, ny, spacing, size, spritesheet) {
  var vertexBuffer = makeBufferForVertices(gl,
                                           gl.getAttribLocation(program, 'a_position'));

  var uvBuffer = makeBufferForTextureCoordinates(gl,
                                                 gl.getAttribLocation(program, "a_texcoords"));

  var draw = drawRectangle(vertexBuffer, uvBuffer);
  var uv = null;

  for (var i = 0; i < nx; ++i) {
    for (var j = 0; j < ny; ++j) {
      var color = [Math.random(), Math.random(), Math.random(), 1];
      var x = (size + spacing) * i,
          y = (size + spacing) * j;

      if (spritesheet) {
        uv = spritesheet.getRectangleUVForSprite(i, j);
      }

      setColor(gl, program, color);
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

  var gl = getContext(canvasId);
  var program = setupProgram(gl, '2d-vertex-shader', '2d-fragment-shader');
  init(gl);

  setResolution(gl, program, canvasId);

  var draw = function(spritesheet) {
    var nRectanglesX = 30;
    var nRectanglesY = nRectanglesX;
    var spacing = - canvas.width / 100;
    drawRectangleGrid(gl, program, nRectanglesX, nRectanglesY, spacing, canvas.width / nRectanglesX, spritesheet);
  }

  draw();

  var texturePath = 'http://127.0.0.1:8000/textures/emoji_square.png';
  // var texturePath = 'http://127.0.0.1:8000/textures/doge.jpg';
  loadTextureAsync(gl, texturePath, [0, 0, 255, 255], draw);
}

main();
