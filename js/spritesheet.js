'use strict';

/**
 * Data structure representing the spritesheet.
 * Each sprite has a fixed square size.
 *
 * @param originalWidth Original size of the image (it may have been resized
 *                      to use a power-of-two size).
 * @param w Width of a single element of the spritesheet.
 */
module.exports = {
  createFromImage: function(image, originalWidth, originalHeight, w, h) {
    w = w || 16;
    h = h || (w || 16);
    // TODO: mechanism to exclude specific sprites from being used
    return {
      width: w,
      height: h,
      sheetWidth: originalWidth,
      sheetHeight: originalHeight,

      nx: Math.floor(originalWidth / w),
      ny: Math.floor(originalHeight / h),

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
          x0, y1,
          x1, y1,
          x1, y0,
        ];
      }
    };
  }
};
