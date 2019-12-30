// Copyright 2019, University of Colorado Boulder

/**
 * This scene shows a single rectangular aperture with an adjustable width and height.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DiffractionScene = require( 'WAVE_INTERFERENCE/diffraction/model/DiffractionScene' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );
  const Utils = require( 'DOT/Utils' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  class RectangleScene extends DiffractionScene {

    constructor() {

      const widthProperty = new NumberProperty( 100E-3, {
        range: new Range( 40E-3, 400E-3 ),
        units: 'mm'
      } );
      const heightProperty = new NumberProperty( 100E-3, {
        range: new Range( 40E-3, 400E-3 ),
        units: 'mm'
      } );
      super( [ widthProperty, heightProperty ] );

      // @public {NumberProperty} - in mm
      this.widthProperty = widthProperty;

      // @public {NumberProperty} - in mm
      this.heightProperty = heightProperty;
    }

    /**
     * Render the aperture shape(s) to the canvas context.
     * @param {CanvasRenderingContext2D} context
     * @protected
     * @override
     */
    renderToContext( context ) {
      const modelToMatrixScale = WaveInterferenceConstants.DIFFRACTION_MODEL_TO_MATRIX_SCALE;
      const columnRadius = Utils.roundSymmetric( this.widthProperty.value * modelToMatrixScale / 2 );
      const rowRadius = Utils.roundSymmetric( this.heightProperty.value * modelToMatrixScale / 2 );

      context.fillRect(
        WaveInterferenceConstants.DIFFRACTION_MATRIX_DIMENSION / 2 - columnRadius,
        WaveInterferenceConstants.DIFFRACTION_MATRIX_DIMENSION / 2 - rowRadius,
        columnRadius * 2, rowRadius * 2
      );
    }
  }

  return waveInterference.register( 'RectangleScene', RectangleScene );
} );