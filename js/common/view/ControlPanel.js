// Copyright 2018, University of Colorado Boulder

/**
 * Shows the main controls, including frequency/wavelength and amplitude.
 * TODO: rename to "MainControlPanel" or "WavesControlPanel"
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Checkbox = require( 'SUN/Checkbox' );
  var HSeparator = require( 'SUN/HSeparator' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var SceneType = require( 'WAVE_INTERFERENCE/common/model/SceneType' );
  var Text = require( 'SCENERY/nodes/Text' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  var WaveInterferencePanel = require( 'WAVE_INTERFERENCE/common/view/WaveInterferencePanel' );
  var WaveInterferenceSlider = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceSlider' );
  var WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  var amplitudeString = require( 'string!WAVE_INTERFERENCE/amplitude' );
  var frequencyString = require( 'string!WAVE_INTERFERENCE/frequency' );
  var graphString = require( 'string!WAVE_INTERFERENCE/graph' );
  var intensityString = require( 'string!WAVE_INTERFERENCE/intensity' );
  var screenString = require( 'string!WAVE_INTERFERENCE/screen' );

  // constants
  var CHECKBOX_OPTIONS = {
    boxWidth: 12
  };

  /**
   * @param {WavesScreenModel} model
   * @param {AlignGroup} alignGroup
   * @param {Object} [options]
   * @constructor
   */
  function ControlPanel( model, alignGroup, options ) {

    options = _.extend( {
      additionalControl: null,
      showIntensityCheckbox: true
    }, options );

    var frequencySlider = new WaveInterferenceSlider( model.frequencyProperty, WaveInterferenceConstants.MINIMUM_FREQUENCY, WaveInterferenceConstants.MAXIMUM_FREQUENCY );

    // TODO(design): should the light frequency slider have the same tick spacing and snapping as the other frequency
    // sliders?
    // var lightFrequencySlider = new WavelengthSlider( model.wavelengthProperty, {
    //   trackWidth: 150,
    //   trackHeight: 20,
    //   valueVisible: false,
    //   tweakersVisible: false,
    //   thumbWidth: 20,
    //   thumbHeight: 20,
    //   scale: new Vector2( -1, 1 ) // TODO: see scenery-phet issue--are we going to have a different API for this?
    // } );
    var lightFrequencySlider = new Text( 'light frequency slider' );

    // Controls are in the coordinate frame of the lattice
    var soundAndWaterFrequencySlider = new WaveInterferenceSlider( model.frequencyProperty, WaveInterferenceConstants.MINIMUM_FREQUENCY, WaveInterferenceConstants.MAXIMUM_FREQUENCY );
    lightFrequencySlider.centerTop = soundAndWaterFrequencySlider.centerTop.plusXY( WaveInterferenceConstants.MINIMUM_FREQUENCY, 10 );
    var frequencySliderContainer = new Node( { children: [ lightFrequencySlider, soundAndWaterFrequencySlider ] } );
    var amplitudeSlider = new WaveInterferenceSlider( model.amplitudeProperty, WaveInterferenceConstants.MINIMUM_FREQUENCY, 14 );

    var graphCheckbox = new Checkbox( new WaveInterferenceText( graphString ), model.showGraphProperty, CHECKBOX_OPTIONS );
    var screenCheckbox = new Checkbox( new WaveInterferenceText( screenString ), model.showScreenProperty, CHECKBOX_OPTIONS );
    var intensityCheckbox = new Checkbox( new WaveInterferenceText( intensityString ), model.showIntensityGraphProperty, CHECKBOX_OPTIONS );
    var maxComponentWidth = _.max( [ screenCheckbox.width, graphCheckbox.width, frequencySlider.width, amplitudeSlider.width, lightFrequencySlider.width ] );
    var separator = new HSeparator( maxComponentWidth );

    var sceneRadioButtons = new RadioButtonGroup( model.sceneProperty, [ {
      value: SceneType.WATER,
      node: new WaveInterferenceText( 'water' )
    }, {
      value: SceneType.SOUND,
      node: new WaveInterferenceText( 'sound' )
    }, {
      value: SceneType.LIGHT,
      node: new WaveInterferenceText( 'light' )
    } ], {
      orientation: 'horizontal'
    } );

    var frequencyTitle = new WaveInterferenceText( frequencyString );
    var amplitudeTitle = new WaveInterferenceText( amplitudeString );

    // Horizontal layout
    var centerX = frequencyTitle.centerX;
    frequencySliderContainer.centerX = centerX;
    amplitudeTitle.centerX = centerX;
    amplitudeSlider.centerX = centerX;
    if ( options.additionalControl ) {options.additionalControl.centerX = centerX;}
    sceneRadioButtons.centerX = centerX;
    separator.centerX = centerX;
    var minX = _.min( [ frequencySliderContainer.left, amplitudeSlider.left, frequencyTitle.left, amplitudeTitle.left, sceneRadioButtons.left ] );
    minX = minX + 11; // Account for half the slider knob width, so it lines up with the slider left tick
    graphCheckbox.left = minX;
    screenCheckbox.left = minX;
    intensityCheckbox.left = minX + 20;

    // Vertical layout
    frequencySliderContainer.top = frequencyTitle.bottom - 5;
    amplitudeTitle.top = frequencySliderContainer.bottom + 2;
    amplitudeSlider.top = amplitudeTitle.bottom - 5;
    if ( options.additionalControl ) {
      options.additionalControl.top = amplitudeSlider.bottom + 5;
      sceneRadioButtons.top = options.additionalControl.bottom + 5;
    }
    else {
      sceneRadioButtons.top = amplitudeSlider.bottom + 5;
    }

    separator.top = sceneRadioButtons.bottom + 7;
    graphCheckbox.top = separator.bottom + 7;
    screenCheckbox.top = graphCheckbox.bottom + 5;
    intensityCheckbox.top = screenCheckbox.bottom + 5;

    model.sceneProperty.link( function( scene ) {
      lightFrequencySlider.visible = scene === SceneType.LIGHT;
      soundAndWaterFrequencySlider.visible = scene === SceneType.SOUND || scene === SceneType.WATER;

      // Screen & Intensity graph should only be available for light scenes. Remove it from water and sound.
      screenCheckbox.enabled = scene === SceneType.LIGHT;
      intensityCheckbox.enabled = scene === SceneType.LIGHT;
    } );

    // z-ordering
    var children = [
      frequencyTitle,
      frequencySliderContainer,
      amplitudeTitle,
      options.additionalControl || new Node(), // This is ugly but preferable to using concat calls
      amplitudeSlider,
      sceneRadioButtons,
      separator,
      graphCheckbox,
      screenCheckbox
    ];

    if ( options.showIntensityCheckbox ) {
      children.push( intensityCheckbox );
    }
    var content = alignGroup.createBox( new Node( {
      children: children
    } ) );

    WaveInterferencePanel.call( this, content, options );
  }

  waveInterference.register( 'ControlPanel', ControlPanel );

  return inherit( WaveInterferencePanel, ControlPanel );
} );