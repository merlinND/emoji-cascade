'use strict';

/**
 * Trajectory function:
 *   (t, dt, [x, y, z]) => [x, y, z]
 * The function exported here are typically trajectory factories,
 * which create trajectory functions given parameters (or by adding
 * some random variations to them).
 */

module.exports = {
  noop: function() {
    return function(t, dt, x, y, z) {
      return [x, y, z];
    };
  },

  straightAhead: function(period, depth) {
    return function(t, dt, x, y, z) {
      var tt = (t % period) / period;
      return [x, y, (1 - tt) * depth];
    };
  },

  perturbations: function(amplitudes) {
    return function(t, dt, x, y, z) {
      return [
        x + dt * (Math.random() - 0.5) * amplitudes[0],
        y + dt * (Math.random() - 0.5) * amplitudes[1],
        z + dt * (Math.random() - 0.5) * amplitudes[2]
      ];
    };
  },

  // Fields of `option`:
  // - `width`, `height` (defaults to the value of `width`)
  // - `period`: time (ms) to travel from `depth` to `0`
  // - `depth`: maximum z value (e.g. -2000 => range -2000...0)
  // - `timeshift`: virtual time offset (ms)
  // - `phase`: phase offset in the rotation (radian)
  spiral: function(options) {
    // Height default to `width`
    var width = options.width;
    var height = options.height || width;
    var period = options.period;
    var depth = options.depth;
    var timeshift = options.timeshift;
    var phase = options.phase;

    return function(t, dt, x, y, z) {
      t = (t + timeshift) % period;
      var tt = t / period;
      // Spiral
      x = width * Math.cos(2 * tt * Math.PI + phase);
      y = height * Math.sin(2 * tt * Math.PI + phase);
      // Depth
      z = depth * (1 - tt);
      return [x, y, z];
    };
  },

  // Fields of `option`:
  // - `baseY`: y coordinate of the top of the cascade
  // - `height`: height of the cascade (used to loop)
  // - `width`: width factor of the arc along the x-axis
  // - `fixedZ`: fixed z coordinate at which the object is placed
  // - `direction`: 1 or -1 (right or left)
  // - `speed`: falling speed (unit: something / time)
  // - `verticalOffset`, `horizontalOffset`: translation of the trajectory
  cascade: function(options) {
    // General idea: x = (+/-) * sqrt(a * | y - b | ) + c
    var baseY = options.baseY || 600;
    var height = options.height || 1100;
    var width = options.width || 250 * (Math.random() - 0.5);
    var fixedZ = options.fixedZ || -600 + 200 * (Math.random() - 0.5);

    var direction = options.direction || (Math.random() < 0.5 ? 1 : -1);
    var verticalOffset = options.verticalOffset || baseY;
    var horizontalOffset = options.verticalOffset || 30 * (Math.random() - 0.5);
    var speedOffset = options.speedOffset || 0.15;
    var speed = options.speed || speedOffset + 0.1 * (Math.random() - 0.5);

    return function(t, dt, x, y, z) {
      y -= dt * speed;
      if (y < baseY - height) {
        y = baseY;
      }
      x = direction * Math.sqrt(width * Math.abs(y - verticalOffset)) + horizontalOffset;
      return [x, y, fixedZ];
    };
  }
};
