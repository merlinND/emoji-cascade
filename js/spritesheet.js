'use strict';

/**
 * Data structure representing the spritesheet.
 * Each sprite has a fixed square size.
 */
module.exports = {
  createFromImage: function(image) {
    var w = 21;
    var h = 21;
    // TODO: mechanism to exclude specific sprites from being used
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
          x0, y1,
          x1, y1,
          x1, y0,
        ];
      }
    };
  }
};
