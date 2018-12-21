// Copyright 2018, University of Colorado Boulder

/**
 * Shows the main controls, including frequency/wavelength and amplitude.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const FrequencyControl = require( 'WAVE_INTERFERENCE/common/view/FrequencyControl' );
  const HSeparator = require( 'SUN/HSeparator' );
  const Node = require( 'SCENERY/nodes/Node' );
  const SceneToggleNode = require( 'WAVE_INTERFERENCE/common/view/SceneToggleNode' );
  const SceneRadioButtonGroup = require( 'WAVE_INTERFERENCE/common/view/SceneRadioButtonGroup' );
  const SoundViewTypeRadioButtonGroup = require( 'WAVE_INTERFERENCE/common/view/SoundViewTypeRadioButtonGroup' );
  const Util = require( 'DOT/Util' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferencePanel = require( 'WAVE_INTERFERENCE/common/view/WaveInterferencePanel' );
  const WaveInterferenceSlider = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceSlider' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  const amplitudeString = require( 'string!WAVE_INTERFERENCE/amplitude' );
  const frequencyString = require( 'string!WAVE_INTERFERENCE/frequency' );
  const graphString = require( 'string!WAVE_INTERFERENCE/graph' );
  const intensityString = require( 'string!WAVE_INTERFERENCE/intensity' );
  const screenString = require( 'string!WAVE_INTERFERENCE/screen' );

  // constants
  const CHECKBOX_OPTIONS = { boxWidth: 14 };

  class WaveInterferenceControlPanel extends WaveInterferencePanel {

    /**
     * @param {WavesModel} model
     * @param {AlignGroup} alignGroup
     * @param {Object} [options]
     */
    constructor( model, alignGroup, options ) {

      options = _.extend( {

        // {Node|null} This additional control (if present) will be shown beneath the Amplitude slider in the
        // WaveInterferenceControlPanel
        additionalControl: null,

        showIntensityCheckbox: true,
        maxWidth: WaveInterferenceConstants.PANEL_MAX_WIDTH
      }, options );

      const frequencyControl = new FrequencyControl( model );

      const amplitudeControl = new SceneToggleNode( model, scene => {

        // For water scene, control the desiredAmplitude (which determines the size of the water drops)
        // For other scenes, control the amplitude directly.
        return new WaveInterferenceSlider( scene.desiredAmplitudeProperty || scene.amplitudeProperty );
      } );

      const soundViewTypeRadioButtonGroup = new SoundViewTypeRadioButtonGroup( model );

      const graphCheckbox = new Checkbox(
        new WaveInterferenceText( graphString ),
        model.showGraphProperty,
        CHECKBOX_OPTIONS
      );
      const screenCheckbox = new Checkbox(
        new WaveInterferenceText( screenString ),
        model.showScreenProperty,
        CHECKBOX_OPTIONS
      );
      const intensityCheckbox = new Checkbox(
        new WaveInterferenceText( intensityString ),
        model.showIntensityGraphProperty,
        CHECKBOX_OPTIONS
      );

      // Only enable the intensity checkbox when the screen is selected
      model.showScreenProperty.link( showScreen => intensityCheckbox.setEnabled( showScreen ) );

      const maxComponentWidth = _.max( [
        soundViewTypeRadioButtonGroup.width,
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

      const sceneRadioButtonGroup = new SceneRadioButtonGroup(
        model.waterScene,
        model.soundScene,
        model.lightScene,
        model.sceneProperty
      );

      const frequencyTitle = new WaveInterferenceText( frequencyString );
      const amplitudeTitle = new WaveInterferenceText( amplitudeString );

      // Horizontal layout
      const centerX = frequencyTitle.centerX;
      frequencyControl.centerX = centerX;
      amplitudeTitle.centerX = centerX;
      amplitudeControl.centerX = centerX;
      if ( options.additionalControl ) {options.additionalControl.centerX = centerX;}
      sceneRadioButtonGroup.centerX = centerX;
      separator.centerX = centerX;
      const minX = _.min( [
        frequencyControl.left,
        amplitudeControl.left,
        frequencyTitle.left,
        amplitudeTitle.left,
        sceneRadioButtonGroup.left
      ] );

      // Align controls to the left
      soundViewTypeRadioButtonGroup.left = minX;
      graphCheckbox.left = minX;
      screenCheckbox.left = minX;

      // Indent the intensity checkbox
      intensityCheckbox.left = minX + 20;

      // Vertical layout
      const TALL_TEXT_SPACING = -2;
      const SHORT_TEXT_SPACING = 5;

      // At the default size, the text should "nestle" into the slider.  But when the text is too small,
      // it must be spaced further away.  See https://github.com/phetsims/wave-interference/issues/194
      const frequencyTitleSpacing = Util.linear( 17, 4, TALL_TEXT_SPACING, SHORT_TEXT_SPACING, frequencyTitle.height );
      frequencyControl.top = frequencyTitle.bottom + frequencyTitleSpacing;
      amplitudeTitle.top = frequencyControl.bottom + 7;

      // At the default size, the text should "nestle" into the slider.  But when the text is too small,
      // it must be spaced further away.  See https://github.com/phetsims/wave-interference/issues/194
      const amplitudeTitleSpacing = Util.linear( 17, 4, TALL_TEXT_SPACING, SHORT_TEXT_SPACING, amplitudeTitle.height );
      amplitudeControl.top = amplitudeTitle.bottom + amplitudeTitleSpacing;

      const y = amplitudeControl.bottom + 5;

      // The Separation NumberControl is an additionalControl
      if ( options.additionalControl ) {
        options.additionalControl.top = y + 8;
        sceneRadioButtonGroup.top = options.additionalControl.bottom + 8 + 8;
      }
      else {
        sceneRadioButtonGroup.top = y + 8;
      }
      const HORIZONTAL_SEPARATOR_MARGIN = 7;
      const CHECKBOX_SPACING = 6;
      separator.top = sceneRadioButtonGroup.bottom + 12;
      graphCheckbox.top = separator.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      soundViewTypeRadioButtonGroup.top = graphCheckbox.bottom + CHECKBOX_SPACING + 2;
      screenCheckbox.top = graphCheckbox.bottom + CHECKBOX_SPACING;
      intensityCheckbox.top = screenCheckbox.bottom + CHECKBOX_SPACING;

      const container = new Node();

      // Update when the scene changes.  Add and remove children so that the panel changes size (has resize:true)
      model.sceneProperty.link( scene => {

        // z-ordering
        container.children = [

          frequencyTitle,
          frequencyControl,

          amplitudeTitle,
          amplitudeControl,

          ...( options.additionalControl ? [ options.additionalControl ] : [] ),
          sceneRadioButtonGroup,
          separator,
          graphCheckbox,

          // Wave/Particle selection only for Sound scene
          ...( scene === model.soundScene && model.soundScene.showSoundParticles ? [ soundViewTypeRadioButtonGroup ] : [] ),

          // Screen & Intensity graph should only be available for light scenes. Remove it from water and sound.
          ...( scene === model.lightScene ? [ screenCheckbox ] : [] ),
          ...( scene === model.lightScene && options.showIntensityCheckbox ? [ intensityCheckbox ] : [] )
        ];
      } );

      const content = alignGroup.createBox( container );

      super( content, options );
    }
  }

  return waveInterference.register( 'WaveInterferenceControlPanel', WaveInterferenceControlPanel );
} );