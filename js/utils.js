'use strict';

var webglUtils = require('./webgl-utils');

module.exports = {
  /** Get the WebGL context from the `canvas` element */
  getContext: function(canvasId) {
    var canvas = document.getElementById(canvasId);
    return canvas.getContext('experimental-webgl');
  },

  setupProgram: function(gl, vertexShader, fragmentShader) {
    var program = webglUtils.createProgramFromScripts(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);
    return program;
  },

  /** Allocate a new GL buffer of `n` elements for the given attributes */
  makeBuffer: function(gl, n, attribute) {
    var buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, n, gl.FLOAT, false, 0, 0);

    return buffer;
  },

  fillBuffer: function(gl, buffer, values) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(values),
        gl.STATIC_DRAW
      );
  },

  setColor: function(gl, program, color) {
    var colorAttribute = gl.getUniformLocation(program, 'u_color');
    gl.uniform4fv(colorAttribute, color);
  },
};
