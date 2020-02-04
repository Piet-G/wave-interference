// Copyright 2018-2020, University of Colorado Boulder

/**
 * Shows the main controls, including frequency/wavelength and amplitude.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AmplitudeControl = require( 'WAVE_INTERFERENCE/common/view/AmplitudeControl' );
  const FrequencyControl = require( 'WAVE_INTERFERENCE/common/view/FrequencyControl' );
  const HSeparator = require( 'SUN/HSeparator' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const platform = require( 'PHET_CORE/platform' );
  const SceneRadioButtonGroup = require( 'WAVE_INTERFERENCE/common/view/SceneRadioButtonGroup' );
  const SoundViewTypeRadioButtonGroup = require( 'WAVE_INTERFERENCE/common/view/SoundViewTypeRadioButtonGroup' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceCheckbox = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceCheckbox' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferencePanel = require( 'WAVE_INTERFERENCE/common/view/WaveInterferencePanel' );
  const WaveInterferenceQueryParameters = require( 'WAVE_INTERFERENCE/common/WaveInterferenceQueryParameters' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  const graphString = require( 'string!WAVE_INTERFERENCE/graph' );
  const intensityString = require( 'string!WAVE_INTERFERENCE/intensity' );
  const playToneString = require( 'string!WAVE_INTERFERENCE/playTone' );
  const screenString = require( 'string!WAVE_INTERFERENCE/screen' );
  const soundEffectString = require( 'string!WAVE_INTERFERENCE/soundEffect' );

  class WaveInterferenceControlPanel extends WaveInterferencePanel {

    /**
     * @param {WavesModel} model
     * @param {AlignGroup} alignGroup
     * @param {Object} [options]
     */
    constructor( model, alignGroup, options ) {

      options = merge( {

        // {Node|null} This additional control (if present) will be shown beneath the Amplitude slider in the
        // WaveInterferenceControlPanel
        additionalControl: null,

        showIntensityCheckbox: true,
        maxWidth: WaveInterferenceConstants.PANEL_MAX_WIDTH,
        yMargin: 4,
        showSceneRadioButtons: true,
        showPlaySoundControl: false,
        supportsSound: true
      }, options );

      const frequencyControl = new FrequencyControl( model );
      const amplitudeControl = new AmplitudeControl( model );

      let soundViewTypeRadioButtonGroup = null;
      if ( model.soundScene && model.soundScene.showSoundParticles ) {
        soundViewTypeRadioButtonGroup = new SoundViewTypeRadioButtonGroup( model );
      }

      const graphCheckbox = new WaveInterferenceCheckbox(
        new WaveInterferenceText( graphString, WaveInterferenceConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
        model.showGraphProperty, {
          audioEnabled: options.supportsSound
        } );
      const screenCheckbox = new WaveInterferenceCheckbox(
        new WaveInterferenceText( screenString, WaveInterferenceConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
        model.showScreenProperty, {
          audioEnabled: options.supportsSound
        } );
      const intensityCheckbox = new WaveInterferenceCheckbox(
        new WaveInterferenceText( intensityString, WaveInterferenceConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
        model.showIntensityGraphProperty, {
          audioEnabled: options.supportsSound
        } );

      // Only enable the intensity checkbox when the screen is selected
      model.showScreenProperty.link( showScreen => intensityCheckbox.setEnabled( showScreen ) );

      const maxComponentWidth = _.max( [
        ...( soundViewTypeRadioButtonGroup ? [ soundViewTypeRadioButtonGroup.width ] : [] ),
        screenCheckbox.width,
        graphCheckbox.width,
        frequencyControl.width,
        amplitudeControl.width
      ] );
      const separator = new HSeparator( maxComponentWidth );

      // Set pointer areas for the checkboxes, now that we have the separator dimensions.
      graphCheckbox.mouseArea = graphCheckbox.localBounds.dilated( 2 ).withX( separator.right );
      graphCheckbox.touchArea = graphCheckbox.mouseArea;

      screenCheckbox.mouseArea = screenCheckbox.localBounds.dilated( 2 ).withX( separator.right );
      screenCheckbox.touchArea = screenCheckbox.mouseArea;

      intensityCheckbox.mouseArea = intensityCheckbox.localBounds.dilated( 2 ).withX( separator.right );
      intensityCheckbox.touchArea = intensityCheckbox.mouseArea;

      // See also playToneCheckbox mouseArea/touchArea set below

      const sceneRadioButtonGroup = options.showSceneRadioButtons ? new SceneRadioButtonGroup(
        model.waterScene,
        model.soundScene,
        model.lightScene,
        model.sceneProperty
      ) : null;

      let playToneCheckbox = null;

      // Only show the Play Tone checkbox for the Sound Scene, if specified.  Not supported on Internet Explorer
      // due to lack of IE support for tambo, see https://github.com/phetsims/wave-interference/issues/425
      if ( model.soundScene && options.showPlaySoundControl && !platform.ie ) {
        playToneCheckbox = new WaveInterferenceCheckbox( new WaveInterferenceText( playToneString, WaveInterferenceConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
          model.soundScene.isTonePlayingProperty, {
            audioEnabled: options.supportsSound
          } );

        playToneCheckbox.mouseArea = playToneCheckbox.localBounds.dilated( 2 ).withX( separator.right );
        playToneCheckbox.touchArea = playToneCheckbox.mouseArea;
      }

      // Horizontal layout
      const centerX = frequencyControl.centerX;
      frequencyControl.centerX = centerX;
      amplitudeControl.centerX = centerX;
      if ( options.additionalControl ) {options.additionalControl.centerX = centerX;}
      if ( sceneRadioButtonGroup ) { sceneRadioButtonGroup.centerX = centerX; }
      separator.centerX = centerX;
      const minX = _.min( [
        frequencyControl.left,
        amplitudeControl.left,
        ...( sceneRadioButtonGroup ? [ sceneRadioButtonGroup.left ] : [] )
      ] );

      // Align controls to the left
      if ( soundViewTypeRadioButtonGroup ) {
        soundViewTypeRadioButtonGroup.left = minX;
      }
      graphCheckbox.left = minX;
      screenCheckbox.left = minX;
      if ( playToneCheckbox ) {
        playToneCheckbox.left = minX;
      }

      // Indent the intensity checkbox
      intensityCheckbox.left = minX + 20;

      // Vertical layout
      amplitudeControl.top = frequencyControl.bottom + 7;
      const y = amplitudeControl.bottom + 5;

      // The Separation NumberControl is an additionalControl
      if ( options.additionalControl ) {
        options.additionalControl.top = y + 8;
        if ( sceneRadioButtonGroup ) {
          sceneRadioButtonGroup.top = options.additionalControl.bottom + 8 + 8;
        }
      }
      else {
        if ( sceneRadioButtonGroup ) {
          sceneRadioButtonGroup.top = y + 8;
        }
      }
      const HORIZONTAL_SEPARATOR_MARGIN = 7;
      const CHECKBOX_SPACING = 6;
      separator.top = sceneRadioButtonGroup ? ( sceneRadioButtonGroup.bottom + 8 ) : y;
      graphCheckbox.top = separator.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      if ( playToneCheckbox ) {
        playToneCheckbox.top = graphCheckbox.bottom + CHECKBOX_SPACING;
      }
      if ( soundViewTypeRadioButtonGroup ) {
        soundViewTypeRadioButtonGroup.top = ( playToneCheckbox ? playToneCheckbox.bottom : graphCheckbox.bottom ) + CHECKBOX_SPACING + 2;
      }
      screenCheckbox.top = graphCheckbox.bottom + CHECKBOX_SPACING;
      intensityCheckbox.top = screenCheckbox.bottom + CHECKBOX_SPACING;

      const container = new Node();

      const createLightSonificationCheckbox = () => {

        const lastCheckbox = options.showIntensityCheckbox ? intensityCheckbox : screenCheckbox;
        return new WaveInterferenceCheckbox(
          new WaveInterferenceText( soundEffectString, WaveInterferenceConstants.CONTROL_PANEL_TEXT_MAX_WIDTH_OPTIONS ),
          model.lightScene.soundEffectEnabledProperty, {
            audioEnabled: options.supportsSound,
            top: lastCheckbox.bottom + CHECKBOX_SPACING,
            left: screenCheckbox.left
          } );
      };

      // Update when the scene changes.  Add and remove children so that the panel changes size (has resize:true)
      model.sceneProperty.link( scene => {

        // z-ordering
        container.children = [

          frequencyControl,
          amplitudeControl,

          ...( options.additionalControl ? [ options.additionalControl ] : [] ),
          ...( sceneRadioButtonGroup ? [ sceneRadioButtonGroup ] : [] ),
          separator,
          graphCheckbox,

          ...( scene === model.soundScene && playToneCheckbox ? [ playToneCheckbox ] : [] ),

          // Wave/Particle selection only for Sound scene
          ...( scene === model.soundScene && model.soundScene.showSoundParticles ? [ soundViewTypeRadioButtonGroup ] : [] ),

          // Screen & Intensity graph should only be available for light scenes. Remove it from water and sound.
          ...( scene === model.lightScene ? [ screenCheckbox ] : [] ),
          ...( scene === model.lightScene && options.showIntensityCheckbox ? [ intensityCheckbox ] : [] ),
          ...( scene === model.lightScene && WaveInterferenceQueryParameters.lightSonificationCheckbox ? [ createLightSonificationCheckbox() ] : [] )
        ];
      } );

      const content = alignGroup.createBox( container );

      super( content, options );
    }
  }

  return waveInterference.register( 'WaveInterferenceControlPanel', WaveInterferenceControlPanel );
} );