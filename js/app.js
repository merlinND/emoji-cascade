'use strict';

/**
 * Get the WebGL context from the `canvas` element
 */
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
    // Now that the image has loaded make copy it to the texture.
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

    requestAnimationFrame(cb);
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
  return function(gl, x, y, width, height) {
    var verticesCoordinates = [
        x,         y,
        x,         y + height,
        x + width, y,
        x + width, y + height,
        x        , y + height,
        x + width, y,
      ];
    var textureCoordinates = [
      0, 0,
      0, 1,
      1, 0,
      1, 1,
      0, 1,
      1, 0,
    ]

    // Draw triangles
    fillRectangleBuffer(gl, vertexBuffer, verticesCoordinates);
    fillTextureCoordinatesBuffer(gl, uvBuffer, textureCoordinates);
    gl.drawArrays(gl.TRIANGLES, 0, verticesCoordinates.length / 2);
  }
}

var drawRectangleGrid = function(gl, program, nx, ny, spacing, size) {
  var vertexBuffer = makeBufferForVertices(gl,
                                           gl.getAttribLocation(program, 'a_position'));

  var uvBuffer = makeBufferForTextureCoordinates(gl,
                                                 gl.getAttribLocation(program, "a_texcoords"));

  var draw = drawRectangle(vertexBuffer, uvBuffer);
  for (var i = 0; i < nx; ++i) {
    for (var j = 0; j < ny; ++j) {
      var color = [Math.random(), Math.random(), Math.random(), 1];
      var x = (size + spacing) * i,
          y = (size + spacing) * j;

      setColor(gl, program, color);
      draw(gl, x, y, size, size, color);
    }
  }
}

var main = function() {
  var canvasId = 'canvas';
  var canvas = document.getElementById(canvasId);

  var gl = getContext(canvasId);
  var program = setupProgram(gl, '2d-vertex-shader', '2d-fragment-shader');

  setResolution(gl, program, canvasId);

  var draw = function() {
    var nRectanglesX = 10;
    var nRectanglesY = nRectanglesX;
    var spacing = canvas.width / 50;
    drawRectangleGrid(gl, program, nRectanglesX, nRectanglesY, spacing, canvas.width / nRectanglesX);
  }

  draw();

  // var texturePath = 'http://127.0.0.1:8000/textures/sheet_apple_16.png';
  var texturePath = 'http://127.0.0.1:8000/textures/doge.jpg';
  loadTextureAsync(gl, texturePath, [0, 0, 255, 255], draw);
}

main();
