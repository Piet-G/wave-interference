// Copyright 2018, University of Colorado Boulder

/**
 * Model for the Interference screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WavesScreenModel = require( 'WAVE_INTERFERENCE/waves/model/WavesScreenModel' );

  class InterferenceScreenModel extends WavesScreenModel {
    constructor() {
      super( {
        numberOfSources: 2,
        initialAmplitude: 10
      } );
    }
  }

  return waveInterference.register( 'InterferenceScreenModel', InterferenceScreenModel );
} );