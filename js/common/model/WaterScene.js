// Copyright 2018, University of Colorado Boulder

/**
 * The model for the Water scene, which adds WaterDrop instances.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const arrayRemove = require( 'PHET_CORE/arrayRemove' );
  const Property = require( 'AXON/Property' );
  const Scene = require( 'WAVE_INTERFERENCE/common/model/Scene' );
  const WaterDrop = require( 'WAVE_INTERFERENCE/common/model/WaterDrop' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  // TODO: use correct physics for drop emit times
  let lastDropTime = null;

  class WaterScene extends Scene {

    /**
     * @param {Object} config - see Scene for required properties
     */
    constructor( config ) {
      super( config );

      this.desiredFrequencyProperty = new Property( this.initialFrequency );

      // @public (read-only) {WaterDrop[]} drops of water that are falling from the hose to the lattice.
      this.waterDrops = [];

      this.inited = false;
    }

    /**
     * Move forward in time by the specified amount, updating velocity and position of the SoundParticle instances
     * @param {WavesScreenModel} model
     * @param {number} dt - amount of time to move forward, in the units of the scene
     */
    step( model, dt ) {

      if ( !this.inited ) {
        model.button1PressedProperty.link( button1Pressed => {
          if ( button1Pressed ) {
            lastDropTime = null; // prep to fire a new drop in the next frame
          }
        } );
        this.inited = true;
      }

      super.step( model, dt );

      var time = model.timeProperty.value;
      var period = 1 / this.desiredFrequencyProperty.value;

      // TODO: support both emitters
      const timeSinceLastDrop = time - lastDropTime;
      if ( lastDropTime === null || timeSinceLastDrop > period ) {
        const amplitude = model.button1PressedProperty.value ? model.desiredAmplitudeProperty.value : 0;
        this.waterDrops.push( new WaterDrop( this.desiredFrequencyProperty.value, amplitude, 100 ) );
        lastDropTime = time;
      }

      var toRemove = [];
      for ( let waterDrop of this.waterDrops ) {

        // Tuned so that the wave goes underwater when the drop hits
        waterDrop.y -= 6;

        // Remove drop that have hit the water
        if ( waterDrop.y < 0 ) {
          toRemove.push( waterDrop );
          model.amplitudeProperty.set( waterDrop.amplitude );
          model.waterScene.frequencyProperty.set( waterDrop.frequency );

          // TODO: is this better, or an on/off thing?
          model.continuousWave1OscillatingProperty.value = waterDrop.amplitude > 0;
          // TODO: phase?
        }
      }
      for ( let element of toRemove ) {
        arrayRemove( this.waterDrops, element );
      }
    }
  }

  return waveInterference.register( 'WaterScene', WaterScene );
} );