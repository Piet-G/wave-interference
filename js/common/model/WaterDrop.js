// Copyright 2018, University of Colorado Boulder

/**
 * Model for a single water drop, which conveys a new value for amplitude and frequency to the model.
 * For water, the controls set desiredAmplitude, desiredFrequency.  Those values are transmitted by a water drop.
 * When reaching the water, they set the wave amplitude and frequency accordingly.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  class WaterDrop {

    /**
     * @param {number} frequency in the units of the water scene
     * @param {number} amplitude - strength of the wave
     * @param {number} targetCellJ - distance to fall before the particles meets the plane of the lattice
     * @param {boolean} isShutoffSignal - true if this isn't really a water drop, but instead a signal to shut off the oscillator
     * @param {number} y - distance to fall before the particles meets the plane of the lattice
     *
     * TODO: indicate what lattice cell it is aiming for so we can support two sources
     * TODO: this will require factoring out a "desiredPosition" or "desiredSeparation"
     */
    constructor( frequency, amplitude, targetCellJ, isShutoffSignal, y ) {

      // @public (read-only)
      this.y = y;

      // @public (read-only)
      this.frequency = frequency;

      // @public (read-only) - the amplitude of the water.  0 may also indicate a signal to stop the oscillation.  TODO: update this doc
      this.amplitude = amplitude;

      // @public - In side view, if the drop has gone beneath the water, it gets absorbed.  In this case, it means it
      // should no longer be visible.  But the modeled time that it affects the lattice is the same.
      this.absorbed = false;

      // TODO: docs
      this.isShutoffSignal = isShutoffSignal;
    }
  }

  return waveInterference.register( 'WaterDrop', WaterDrop );
} );