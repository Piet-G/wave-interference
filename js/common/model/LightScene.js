// Copyright 2018, University of Colorado Boulder

/**
 * The model for the Light scene, which adds the intensity sampling for the screen at the right hand side.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const IntensitySample = require( 'WAVE_INTERFERENCE/common/model/IntensitySample' );
  const Scene = require( 'WAVE_INTERFERENCE/common/model/Scene' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  class LightScene extends Scene {

    /**
     * @param {Object} config - see Scene for required properties
     */
    constructor( config ) {
      super( config );

      // @public {IntensitySample} reads out the intensity on the right hand side of the lattice
      this.intensitySample = new IntensitySample( this.lattice );
    }

    clear() {
      super.clear();

      // Permit calls to clear before subclass is initialized
      this.intensitySample && this.intensitySample.clear();
    }

    advanceTime( wallDT, manualStep ) {
      super.advanceTime( wallDT, manualStep );
      this.intensitySample.step();
    }
  }

  return waveInterference.register( 'LightScene', LightScene );
} );