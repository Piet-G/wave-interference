// Copyright 2018, University of Colorado Boulder

/**
 * Shows the main controls, including frequency/wavelength and amplitude.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Checkbox = require( 'SUN/Checkbox' );
  const DynamicProperty = require( 'AXON/DynamicProperty' );
  const FrequencySlider = require( 'SCENERY_PHET/FrequencySlider' );
  const HSeparator = require( 'SUN/HSeparator' );
  const Image = require( 'SCENERY/nodes/Image' );
  const LaserPointerNode = require( 'SCENERY_PHET/LaserPointerNode' );
  const LightEmitterNode = require( 'WAVE_INTERFERENCE/common/view/LightEmitterNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const SoundViewType = require( 'WAVE_INTERFERENCE/common/model/SoundViewType' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferencePanel = require( 'WAVE_INTERFERENCE/common/view/WaveInterferencePanel' );
  const WaveInterferenceSlider = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceSlider' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );
  const WaveInterferenceUtils = require( 'WAVE_INTERFERENCE/common/WaveInterferenceUtils' );

  // strings
  const amplitudeString = require( 'string!WAVE_INTERFERENCE/amplitude' );
  const frequencyString = require( 'string!WAVE_INTERFERENCE/frequency' );
  const graphString = require( 'string!WAVE_INTERFERENCE/graph' );
  const intensityString = require( 'string!WAVE_INTERFERENCE/intensity' );
  const screenString = require( 'string!WAVE_INTERFERENCE/screen' );
  const wavesString = require( 'string!WAVE_INTERFERENCE/waves' );
  const particlesString = require( 'string!WAVE_INTERFERENCE/particles' );
  const bothString = require( 'string!WAVE_INTERFERENCE/both' );

  // images
  const hoseImage = require( 'image!WAVE_INTERFERENCE/hose.png' );
  const speakerImage = require( 'image!WAVE_INTERFERENCE/speaker.png' );

  // constants
  const CHECKBOX_OPTIONS = { boxWidth: 12 };
  const fromFemto = WaveInterferenceUtils.fromFemto;

  class WaveInterferenceControlPanel extends WaveInterferencePanel {

    /**
     * @param {WavesScreenModel} model
     * @param {AlignGroup} alignGroup
     * @param {Object} [options]
     */
    constructor( model, alignGroup, options ) {

      options = _.extend( {

        // This additional control (if present) will be shown beneath the Amplitude slider in the WaveInterferenceControlPanel
        additionalControl: null,

        showIntensityCheckbox: true,
        showAmplitudeSlider: true
      }, options );

      // Controls are in the metric coordinate frame
      const waterFrequencySlider = new WaveInterferenceSlider( model.waterScene.desiredFrequencyProperty, model.waterScene.minimumFrequency, model.waterScene.maximumFrequency );
      const soundFrequencySlider = new WaveInterferenceSlider( model.soundScene.frequencyProperty, model.soundScene.minimumFrequency, model.soundScene.maximumFrequency );

      // Create a Property in Hz as required by the FrequencySlider.
      const frequencyInHzProperty = new DynamicProperty( new Property( model.lightScene.frequencyProperty ), {
        bidirectional: true,
        map: frequency => WaveInterferenceUtils.fromFemto( frequency ),
        inverseMap: frequency => WaveInterferenceUtils.toFemto( frequency ),

        // This Property can exhibit re-entry when the user drags the frequency slider.  This is caused by an epsilon
        // problem, such as: value=526809876917351.56, oldValue=526809876917351.5
        // Hence it must be marked as reentrant
        reentrant: true
      } );

      const lightFrequencySlider = new FrequencySlider( frequencyInHzProperty, {
        minFrequency: fromFemto( model.lightScene.minimumFrequency ),
        maxFrequency: fromFemto( model.lightScene.maximumFrequency ),
        trackWidth: 150,
        trackHeight: 20,
        valueVisible: false,
        tweakersVisible: false,
        thumbWidth: 20,
        thumbHeight: 20
      } );

      lightFrequencySlider.centerTop = soundFrequencySlider.centerTop.plusXY( 0, 10 );
      const frequencySliderContainer = new Node( { children: [ waterFrequencySlider, soundFrequencySlider, lightFrequencySlider ] } );
      const amplitudeSlider = new WaveInterferenceSlider( model.desiredAmplitudeProperty, model.amplitudeProperty.range.min, model.amplitudeProperty.range.max );

      const viewSelectionRadioButtonGroup = new VerticalAquaRadioButtonGroup( [ {
        node: new WaveInterferenceText( wavesString ),
        value: SoundViewType.WAVES,
        property: model.soundScene.viewSelectionProperty
      }, {
        node: new WaveInterferenceText( particlesString ),
        value: SoundViewType.PARTICLES,
        property: model.soundScene.viewSelectionProperty
      }, {
        node: new WaveInterferenceText( bothString ),
        value: SoundViewType.BOTH,
        property: model.soundScene.viewSelectionProperty
      } ], {
        radioButtonOptions: {

          // Manually tuned so the radio buttons have the same width as the "Graph" checkbox
          radius: 5.5
        }
      } );
      const graphCheckbox = new Checkbox( new WaveInterferenceText( graphString ), model.showGraphProperty, CHECKBOX_OPTIONS );

      const screenCheckbox = new Checkbox( new WaveInterferenceText( screenString ), model.showScreenProperty, CHECKBOX_OPTIONS );
      const intensityCheckbox = new Checkbox( new WaveInterferenceText( intensityString ), model.showIntensityGraphProperty, CHECKBOX_OPTIONS );

      // Only enable the intensity checkbox when the screen is selected
      model.showScreenProperty.link( showScreen => intensityCheckbox.setEnabled( showScreen ) );

      const maxComponentWidth = _.max( [
        viewSelectionRadioButtonGroup.width,
        screenCheckbox.width,
        graphCheckbox.width,
        frequencySliderContainer.width,
        amplitudeSlider.width,
        lightFrequencySlider.width
      ] );
      const separator = new HSeparator( maxComponentWidth );

      const hoseIcon = new Image( hoseImage );
      const speakerIcon = new Image( speakerImage );
      const laserPointerIcon = new LaserPointerNode( new BooleanProperty( false ), LightEmitterNode.DEFAULT_OPTIONS );
      const iconWidth = 44;
      const iconHeight = iconWidth;
      hoseIcon.scale( iconWidth / hoseIcon.width );
      speakerIcon.scale( iconHeight / speakerIcon.height );
      laserPointerIcon.scale( iconWidth / laserPointerIcon.width );
      const sceneRadioButtons = new RadioButtonGroup( model.sceneProperty, [
        { value: model.waterScene, node: hoseIcon },
        { value: model.soundScene, node: speakerIcon },
        { value: model.lightScene, node: laserPointerIcon }
      ], {
        orientation: 'horizontal'
      } );

      const frequencyTitle = new WaveInterferenceText( frequencyString );
      const amplitudeTitle = new WaveInterferenceText( amplitudeString );

      // Horizontal layout
      const centerX = frequencyTitle.centerX;
      frequencySliderContainer.centerX = centerX;
      amplitudeTitle.centerX = centerX;
      amplitudeSlider.centerX = centerX;
      if ( options.additionalControl ) {options.additionalControl.centerX = centerX;}
      sceneRadioButtons.centerX = centerX;
      separator.centerX = centerX;
      let minX = _.min( [ frequencySliderContainer.left, amplitudeSlider.left, frequencyTitle.left, amplitudeTitle.left, sceneRadioButtons.left ] );
      minX = minX + 11; // Account for half the slider knob width, so it lines up with the slider left tick

      // Align controls to the left
      viewSelectionRadioButtonGroup.left = minX;
      graphCheckbox.left = minX;
      screenCheckbox.left = minX;

      // Indent the intensity checkbox
      intensityCheckbox.left = minX + 20;

      // Vertical layout
      const TITLE_SPACING = 5;
      frequencySliderContainer.top = frequencyTitle.bottom - TITLE_SPACING;
      amplitudeTitle.top = frequencySliderContainer.bottom + 2;
      amplitudeSlider.top = amplitudeTitle.bottom - TITLE_SPACING;
      const y = options.showAmplitudeSlider ?
                amplitudeSlider.bottom + TITLE_SPACING :
                frequencySliderContainer.bottom + 2;
      if ( options.additionalControl ) {
        options.additionalControl.top = y;
        sceneRadioButtons.top = options.additionalControl.bottom + TITLE_SPACING;
      }
      else {
        sceneRadioButtons.top = y;
      }
      const HORIZONTAL_SEPARATOR_MARGIN = 7;
      const CHECKBOX_SPACING = 5;
      separator.top = sceneRadioButtons.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      graphCheckbox.top = separator.bottom + HORIZONTAL_SEPARATOR_MARGIN;
      viewSelectionRadioButtonGroup.top = graphCheckbox.bottom + CHECKBOX_SPACING;
      screenCheckbox.top = graphCheckbox.bottom + CHECKBOX_SPACING;
      intensityCheckbox.top = screenCheckbox.bottom + CHECKBOX_SPACING;

      const container = new Node();

      // Update when the scene changes.  Add and remove children so that the panel changes size (has resize:true)
      model.sceneProperty.link( scene => {
        waterFrequencySlider.visible = scene === model.waterScene;
        soundFrequencySlider.visible = scene === model.soundScene;
        lightFrequencySlider.visible = scene === model.lightScene;

        // z-ordering
        container.children = [
          frequencyTitle,
          frequencySliderContainer,
          ...( options.showAmplitudeSlider ? [ amplitudeTitle, amplitudeSlider ] : [] ),
          ...( options.additionalControl ? [ options.additionalControl ] : [] ),
          sceneRadioButtons,
          separator,
          graphCheckbox,

          // Wave/Particle selection only for Sound scene
          ...( scene === model.soundScene && model.soundScene.showSoundParticles ? [ viewSelectionRadioButtonGroup ] : [] ),

          // Screen & Intensity graph should only be available for light scenes. Remove it from water and sound.
          ...( scene === model.lightScene ? [ screenCheckbox ] : [] ),
          ...( scene === model.lightScene && options.showIntensityCheckbox ? [ intensityCheckbox ] : [] )
        ];

        graphCheckbox.mouseArea = graphCheckbox.localBounds.dilated( 2 ).withX( separator.width );
        graphCheckbox.touchArea = graphCheckbox.mouseArea;
      } );

      const content = alignGroup.createBox( container );

      super( content, options );
    }
  }

  return waveInterference.register( 'WaveInterferenceControlPanel', WaveInterferenceControlPanel );
} );