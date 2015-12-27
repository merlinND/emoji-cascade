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
    }
  },

  straightAhead: function(speed) {
    return function(t, dt, x, y, z) {
      z = (-z - speed * t) % 1000;
      return [x, y, -z];
    }
  },

  perturbations: function(amplitudes) {
    return function(t, dt, x, y, z) {
      return [
        x + dt * (Math.random() - 0.5) * amplitudes[0],
        y + dt * (Math.random() - 0.5) * amplitudes[1],
        z + dt * (Math.random() - 0.5) * amplitudes[2]
      ];
    }
  },

  // Fields of `option`:
  // - period, depth, width, height, offset
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
    }
  }
}
