// Copyright 2018, University of Colorado Boulder

/**
 * Poolable Image nodes that show WaterDrops.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Image = require( 'SCENERY/nodes/Image' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  // images
  const waterDropImage = require( 'image!WAVE_INTERFERENCE/water_drop.png' );

  class WaterDropImage extends Image {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {
      super( waterDropImage, options );

      // @public {WaterDrop} - Link each Image to its corresponding WaterDrop, so that when the view goes underwater,
      // we can mark the corresponding model as absorbed.
      this.waterDrop = null;
    }
  }

  return waveInterference.register( 'WaterDropImage', WaterDropImage );
} );