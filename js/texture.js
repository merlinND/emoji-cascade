'use strict';

module.exports = {
  load: function(gl, path, placeholderColor, cb) {
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
      // Now that the image has loaded copy it to the texture
      console.log("Successfully loaded texture from: " + path + " (" + image.width + " x " + image.height + ")");
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);

      // TODO: make image size a power of 2 so that we can geretate mipmaps
      var isPowerOf2 = function(n) { return (n & (n - 1)) === 0; };
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        console.warn("Could not generate mipmaps for texture.");
      }

      cb(image);
    });
  },
};
