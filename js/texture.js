'use strict';

var isPowerOf2 = function(n) {
  return (n & (n - 1)) === 0;
};

// Returns a larger image with size the closest larger power of 2, padded with 0.
var padImage = function(image) {
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    return image;
  }

  var size = Math.pow(2, Math.ceil(Math.log2(Math.max(image.width, image.height))));
  var canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  var context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return canvas;
};

module.exports = {
  padImage: padImage,

  load: function(gl, path, placeholderColor, cb) {
    // Create a texture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill the texture with a solid color while waiting for the image to load
    if (placeholderColor) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                    new Uint8Array(placeholderColor));
    }

    // Asynchronously load an image
    var image = new Image();
    image.src = path;
    image.addEventListener('load', function() {
      var originalWidth = image.width;
      var originalHeight = image.height;
      console.log("Successfully loaded texture from: " + path + " (" + originalWidth + " x " + originalHeight + ")");

      // Make image size a power of 2
      // TODO: image seems to be scaled wrongly when using this method, fix
      // image = padImage(image);

      // Now that the image has loaded copy it to the texture
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      } else {
        console.warn("Could not generate mipmaps for texture.");
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }

      if (cb) {
        cb(image, originalWidth, originalHeight);
      }
    });
  },
};
