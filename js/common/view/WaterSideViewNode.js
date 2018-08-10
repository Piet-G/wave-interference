// Copyright 2018, University of Colorado Boulder

/**
 * Shows the water from the side view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferenceUtils = require( 'WAVE_INTERFERENCE/common/WaveInterferenceUtils' );

  class WaterSideViewNode extends Node {

    /**
     * @param {Bounds2} waveAreaBounds
     * @param {WavesScreenModel} model
     */
    constructor( waveAreaBounds, model ) {

      // @private - depicts the side face (when the user selects "side view")
      const sideFacePath = new Path( null, {
        lineJoin: WaveInterferenceConstants.CHART_LINE_JOIN,
        fill: WaveInterferenceConstants.WATER_SIDE_COLOR
      } );

      super( {
        children: [ Rectangle.bounds( waveAreaBounds, { fill: '#e2e3e5' } ), sideFacePath ]
      } );

      // @private
      this.waveAreaBounds = waveAreaBounds;

      // @private
      this.sideFacePath = sideFacePath;

      // @private
      this.model = model;

      // @private - reduce garbage by reusing the same array to get model values
      this.array = [];

      model.lattice.changedEmitter.addListener( this.update.bind( this ) );
    }

    /**
     * @private - update the shapes and text when the rotationAmount has changed
     */
    update() {
      this.sideFacePath.shape = WaveInterferenceUtils.getWaterSideShape( this.array, this.model.lattice, this.waveAreaBounds, 0, 0 )
        .lineTo( this.waveAreaBounds.right, this.waveAreaBounds.maxY )
        .lineTo( this.waveAreaBounds.left, this.waveAreaBounds.maxY )
        .close();
    }
  }

  return waveInterference.register( 'WaterSideViewNode', WaterSideViewNode );
} );