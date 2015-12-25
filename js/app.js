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

// Allocate and fill a GL buffer with vertices
var makeBufferForRectangle = function(gl, attribute) {
  var nTriangles = 2;

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, nTriangles, gl.FLOAT, false, 0, 0);

  return buffer;
}
var fillRectangleBuffer = function(gl, coordinates) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(coordinates),
      gl.STATIC_DRAW
    );
}

var drawRectangle = function(gl, x, y, width, height) {
  var verticesCoordinates = [
      x,         y,
      x,         y + height,
      x + width, y,
      x + width, y + height,
      x        , y + height,
      x + width, y,
    ];

  // Draw triangles
  fillRectangleBuffer(gl, verticesCoordinates);
  gl.drawArrays(gl.TRIANGLES, 0, verticesCoordinates.length / 2);
}

var drawRectangleGrid = function(gl, program, nx, ny, spacing, size) {
  for (var i = 0; i < nx; ++i) {
    for (var j = 0; j < ny; ++j) {
      var color = [Math.random(), Math.random(), Math.random(), 1];
      var x = (size + spacing) * i,
          y = (size + spacing) * j;

      setColor(gl, program, color);
      drawRectangle(gl, x, y, size, size, color);
    }
  }
}

var main = function() {
  var canvasId = 'canvas';
  var canvas = document.getElementById(canvasId);

  var gl = getContext(canvasId);
  var program = setupProgram(gl, '2d-vertex-shader', '2d-fragment-shader');

  setResolution(gl, program, canvasId);

  var positionAttribute = gl.getAttribLocation(program, 'a_position');
  makeBufferForRectangle(gl, positionAttribute);

  var nRectanglesX = 10;
  var nRectanglesY = nRectanglesX;
  var spacing = canvas.width / 50;
  drawRectangleGrid(gl, program, nRectanglesX, nRectanglesY, spacing, canvas.width / nRectanglesX);
}

main();
