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
  }
}
