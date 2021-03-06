// Copyright 2019-2020, University of Colorado Boulder

/**
 * Sets up sounds for items on the Waves Screen which are not already associated with pre-existing components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import lightBeamLoopSound from '../../../sounds/light-beam-loop-v5-eq-out-bass_mp3.js';
import speakerPulseSound from '../../../sounds/speaker-pulse-v4_mp3.js';
import waterDropSound1 from '../../../sounds/water-drop-v5-001_mp3.js';
import waterDropSound2 from '../../../sounds/water-drop-v5-002_mp3.js';
import waterDropSound3 from '../../../sounds/water-drop-v5-003_mp3.js';
import waterDropSound0 from '../../../sounds/water-drop-v5_mp3.js';
import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import waveInterference from '../../waveInterference.js';
import SineWaveGenerator from './SineWaveGenerator.js';

// sounds
const waterDropSounds = [ waterDropSound0, waterDropSound1, waterDropSound2, waterDropSound3 ];

class WavesScreenSoundView {

  /**
   * @param {WavesModel} model
   * @param {WavesScreenView} view
   * @param {Object} [options]
   * @public
   */
  constructor( model, view, options ) {

    // The sound scene generates a sine wave when the "Play Tone" checkbox is checked
    if ( model.soundScene && options.controlPanelOptions.showPlaySoundControl ) {
      const sineWavePlayer = new SineWaveGenerator(
        model.soundScene.frequencyProperty,
        model.soundScene.amplitudeProperty, {
          enableControlProperties: [
            model.soundScene.isTonePlayingProperty,
            model.soundScene.button1PressedProperty,
            model.isRunningProperty,
            DerivedProperty.not( model.isResettingProperty )
          ]
        } );

      // Suppress the tone when another screen is selected
      soundManager.addSoundGenerator( sineWavePlayer, {
        associatedViewNode: view
      } );
    }

    if ( model.waterScene ) {
      const waterDropOptions = { initialOutputLevel: 1.5 };

      const soundClips = waterDropSounds.map( sound => new SoundClip( sound, waterDropOptions ) );
      soundClips.forEach( soundClip => soundManager.addSoundGenerator( soundClip ) );

      // The water drop SoundClip that was most recently played, to avoid repeats
      let lastPlayedWaterDropSoundClip = null;

      // When a water drop is absorbed, play a water drop sound.
      model.waterScene.waterDropAbsorbedEmitter.addListener( waterDrop => {

        // The waterDrop.amplitude indicates the size of the water drop and the strength of the resulting wave.
        // Smaller water drops play with a higher frequency.
        const amplitude = Utils.linear(
          WaveInterferenceConstants.AMPLITUDE_RANGE.min, WaveInterferenceConstants.AMPLITUDE_RANGE.max,
          1.0, 0.5, waterDrop.amplitude
        );

        // Select water drop sounds randomly, but do not let the same sound go twice in a row
        const availableClips = _.without( soundClips, lastPlayedWaterDropSoundClip );
        lastPlayedWaterDropSoundClip = phet.joist.random.sample( availableClips );
        lastPlayedWaterDropSoundClip.setPlaybackRate( amplitude );

        // The wave meter node takes precedence over the water drop sounds
        lastPlayedWaterDropSoundClip.setOutputLevel( view.waveMeterNode.duckingProperty.value * 0.9, 0 );

        lastPlayedWaterDropSoundClip.play();
      } );
    }

    if ( model.soundScene ) {
      const speakerMembraneSoundClip = new SoundClip( speakerPulseSound, {

        // The sound repeats, so the waveform should not be trimmed
        trimSilence: false,
        initialOutputLevel: 0 // The speaker pulse plays when the speaker membrane oscillates.  The outputLevel is set below.
      } );
      soundManager.addSoundGenerator( speakerMembraneSoundClip );

      // When the wave generator completes a full cycle (passing from positive to negative), restart the speaker
      // clip at the corresponding volume and frequency.  Note this means if the frequency or volume changes, the
      // user has to wait for the next cycle to hear the change.
      let previousOscillatorValue = null;
      Property.multilink( [
        model.soundScene.oscillator1Property,
        model.soundScene.isTonePlayingProperty,
        view.waveMeterNode.duckingProperty,
        model.isRunningProperty
      ], ( oscillatorValue, isTonePlaying, ducking, isRunning ) => {

        const maxVolume = isTonePlaying ? 0 : 0.3;
        const outputLevel = Utils.linear(
          // The tone takes precedence over the membrane sound, another level of ducking
          model.soundScene.amplitudeProperty.range.min, model.soundScene.amplitudeProperty.range.max,
          0.0, maxVolume, model.soundScene.amplitudeProperty.value
        );
        const playbackRate = Utils.linear(
          model.soundScene.frequencyProperty.range.min, model.soundScene.frequencyProperty.range.max,
          1, 1.4, model.soundScene.frequencyProperty.value
        );

        // Wave meter node takes precedence over the sound speaker membrane sound
        speakerMembraneSoundClip.setOutputLevel( outputLevel * ducking, 0.2 ); // Time constant must work for amplitude changes and ducking
        speakerMembraneSoundClip.setPlaybackRate( playbackRate / 2 );

        if ( previousOscillatorValue >= 0 && oscillatorValue < 0 ) {
          speakerMembraneSoundClip.play();
        }

        if ( oscillatorValue === 0 || !isRunning ) {
          speakerMembraneSoundClip.stop();
        }

        previousOscillatorValue = oscillatorValue;
      } );
    }

    if ( model.lightScene ) {

      const lightBeamLoopSoundClip = new SoundClip( lightBeamLoopSound, {
        loop: true
      } );

      soundManager.addSoundGenerator( lightBeamLoopSoundClip, {
        associatedViewNode: view
      } );

      const lightAmplitudeProperty = model.lightScene.amplitudeProperty;
      const lightFrequencyProperty = model.lightScene.frequencyProperty;
      Property.multilink( [ lightAmplitudeProperty, lightFrequencyProperty, view.waveMeterNode.duckingProperty ], ( amplitude, frequency, ducking ) => {

        // Sound for "Sound Effect" on the light scene.
        const outputLevel = Utils.linear( lightAmplitudeProperty.range.min, lightAmplitudeProperty.range.max,
          0.0, 0.67, amplitude );
        const playbackRate = Utils.linear( lightFrequencyProperty.range.min, lightFrequencyProperty.range.max,
          1, 1.8, frequency );

        // Wave meter node takes precedence over the light beam sound effect
        lightBeamLoopSoundClip.setOutputLevel( outputLevel * ducking );
        lightBeamLoopSoundClip.setPlaybackRate( playbackRate );
      } );

      Property.multilink( [
        model.lightScene.button1PressedProperty,
        model.isRunningProperty,
        model.lightScene.soundEffectEnabledProperty
      ], ( button1Pressed, isRunning, enabled ) => {
        const shouldPlay = button1Pressed && isRunning && enabled;
        if ( lightBeamLoopSoundClip.isPlaying && !shouldPlay ) {
          lightBeamLoopSoundClip.stop();
        }
        else if ( !lightBeamLoopSoundClip.isPlaying && shouldPlay ) {
          lightBeamLoopSoundClip.play();
        }
      } );
    }
  }
}

waveInterference.register( 'WavesScreenSoundView', WavesScreenSoundView );
export default WavesScreenSoundView;