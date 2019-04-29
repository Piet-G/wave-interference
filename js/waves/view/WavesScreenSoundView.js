// Copyright 2019, University of Colorado Boulder

/**
 * Sets up sounds for the Waves Screen which are not associated with pre-existing components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ResetAllSoundGenerator = require( 'TAMBO/sound-generators/ResetAllSoundGenerator' );
  const SineWaveGenerator = require( 'WAVE_INTERFERENCE/waves/view/SineWaveGenerator' );
  const SoundClip = require( 'TAMBO/sound-generators/SoundClip' );
  const soundManager = require( 'TAMBO/soundManager' );
  const Util = require( 'DOT/Util' ); // eslint-disable-line
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  // sounds
  const speakerPulseSound = require( 'sound!WAVE_INTERFERENCE/speaker-pulse.mp3' );
  const waterDropSound = require( 'sound!WAVE_INTERFERENCE/water-drop.mp3' );

  class WavesScreenSoundView {

    /**
     * @param {WavesModel} model
     * @param {Object} [options]
     */
    constructor( model, options ) {

      // Only wire up for the sound scene
      if ( options.controlPanelOptions.showPlaySoundButton ) {
        const sineWavePlayer = new SineWaveGenerator( model.soundScene.frequencyProperty, model.soundScene.amplitudeProperty, {
          enableControlProperties: [
            model.soundScene.isSoundPlayingProperty,
            model.soundScene.button1PressedProperty,
            model.isRunningProperty
          ]
        } );
        soundManager.addSoundGenerator( sineWavePlayer );
      }

      const waterDropSoundClip = new SoundClip( waterDropSound );
      soundManager.addSoundGenerator( waterDropSoundClip );
      model.waterScene.waterDropAbsorbedEmitter.addListener( waterDrop => {
        const amp = Util.linear( WaveInterferenceConstants.AMPLITUDE_RANGE.min, WaveInterferenceConstants.AMPLITUDE_RANGE.max,
          1.3, 0.5, waterDrop.amplitude );
        waterDropSoundClip.setPlaybackRate( amp );
        waterDropSoundClip.play();
      } );

      soundManager.addSoundGenerator( new ResetAllSoundGenerator( model.isResettingProperty, {
        initialOutputLevel: 0.7
      } ) );

      const speakerPulseSoundClip = new SoundClip( speakerPulseSound );
      soundManager.addSoundGenerator( speakerPulseSoundClip );
      model.soundScene.oscillator1Property.link( ( value, previousValue ) => {
        if ( previousValue >= 0 && value < 0 ) {

          const amplitude = Util.linear( model.soundScene.amplitudeProperty.range.min, model.soundScene.amplitudeProperty.range.max,
            0.0, 0.7, model.soundScene.amplitudeProperty.value );
          const playbackRate = Util.linear( model.soundScene.frequencyProperty.range.min, model.soundScene.frequencyProperty.range.max,
            1, 1.4, model.soundScene.frequencyProperty.value );
          speakerPulseSoundClip.setOutputLevel( amplitude );
          speakerPulseSoundClip.setPlaybackRate( playbackRate );
          speakerPulseSoundClip.play();
        }
      } );
    }

    // TODO: odd workaround for not using statics
    start() {

    }
  }

  return waveInterference.register( 'WavesScreenSoundView', WavesScreenSoundView );
} );