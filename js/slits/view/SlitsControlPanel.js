// Copyright 2018, University of Colorado Boulder

/**
 * Controls for the barrier/slits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BarrierTypeEnum = require( 'WAVE_INTERFERENCE/slits/model/BarrierTypeEnum' );
  const ComboBox = require( 'SUN/ComboBox' );
  const DynamicProperty = require( 'AXON/DynamicProperty' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const Range = require( 'DOT/Range' );
  const ToggleNode = require( 'SUN/ToggleNode' );
  const Util = require( 'DOT/Util' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferencePanel = require( 'WAVE_INTERFERENCE/common/view/WaveInterferencePanel' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  const cmValueString = require( 'string!WAVE_INTERFERENCE/cmValue' );
  const nmValueString = require( 'string!WAVE_INTERFERENCE/nmValue' );
  const noBarrierString = require( 'string!WAVE_INTERFERENCE/noBarrier' );
  const oneSlitString = require( 'string!WAVE_INTERFERENCE/oneSlit' );
  const slitSeparationString = require( 'string!WAVE_INTERFERENCE/slitSeparation' );
  const slitWidthString = require( 'string!WAVE_INTERFERENCE/slitWidth' );
  const twoSlitsString = require( 'string!WAVE_INTERFERENCE/twoSlits' );

  class SlitsControlPanel extends WaveInterferencePanel {

    /**
     * @param {AlignGroup} alignGroup
     * @param {SlitsModel} model
     * @param {Node} comboBoxParent
     */
    constructor( alignGroup, model, comboBoxParent ) {

      const barrierTypeDynamicProperty = new DynamicProperty( model.sceneProperty, {
        derive: 'barrierTypeProperty',
        bidirectional: true
      } );
      
      const comboBox = new ComboBox( [
        ComboBox.createItem( new WaveInterferenceText( noBarrierString ), BarrierTypeEnum.NO_BARRIER ),
        ComboBox.createItem( new WaveInterferenceText( oneSlitString ), BarrierTypeEnum.ONE_SLIT ),
        ComboBox.createItem( new WaveInterferenceText( twoSlitsString ), BarrierTypeEnum.TWO_SLITS )
      ], barrierTypeDynamicProperty, comboBoxParent, {
        buttonYMargin: 0
      } );

      const createLabel = text => new WaveInterferenceText( text, {
        fontSize: WaveInterferenceConstants.TICK_FONT_SIZE,
        maxWidth: WaveInterferenceConstants.TICK_MAX_WIDTH
      } );

      const createTicks = range => [
        { value: range.min, label: createLabel( '' + range.min ) },
        { value: range.max, label: createLabel( '' + range.max ) }
      ];

      // Slit width controls.  Ranges, values and deltas specified in
      // https://github.com/phetsims/wave-interference/issues/177
      const waterRange = new Range( 0.5, 2.5 ); // cm
      const waterSlitWidthControl = new NumberControl(
        slitWidthString, model.waterScene.slitWidthProperty, waterRange, _.extend( {
          delta: 0.1, // cm
          decimalPlaces: 1,
          valuePattern: cmValueString,
          majorTicks: createTicks( waterRange )
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );

      const soundRange = new Range( 20, 160 );
      const soundSlitWidthControl = new NumberControl(
        slitWidthString, model.soundScene.slitWidthProperty, soundRange, _.extend( {
          delta: 1, // cm
          constrainValue: value => Util.roundToInterval( value, 10 ),
          valuePattern: cmValueString,
          majorTicks: createTicks( soundRange )
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );

      const lightRange = new Range( 200, 1600 );
      const lightSlitWidthControl = new NumberControl(
        slitWidthString, model.lightScene.slitWidthProperty, lightRange, _.extend( {
          delta: 10, // nm
          constrainValue: value => Util.roundToInterval( value, 50 ),
          valuePattern: nmValueString,
          majorTicks: createTicks( lightRange )
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
      const slitWidthControl = new ToggleNode( model.sceneProperty, [
        { value: model.waterScene, node: waterSlitWidthControl },
        { value: model.soundScene, node: soundSlitWidthControl },
        { value: model.lightScene, node: lightSlitWidthControl }
      ] );
      barrierTypeDynamicProperty.link( barrierType => {
        const enabled = barrierType === BarrierTypeEnum.ONE_SLIT || barrierType === BarrierTypeEnum.TWO_SLITS;
        waterSlitWidthControl.enabled = enabled;
        soundSlitWidthControl.enabled = enabled;
        lightSlitWidthControl.enabled = enabled;
      } );

      // Slit separation controls.  Ranges, values and deltas specified in
      // https://github.com/phetsims/wave-interference/issues/177
      const waterSeparationRange = new Range( 1, 5 );
      const waterSeparationControl = new NumberControl(
        slitSeparationString,
        model.waterScene.slitSeparationProperty,
        waterSeparationRange,
        _.extend( {
          decimalPlaces: 1,
          delta: 0.1, // cm
          valuePattern: cmValueString,
          majorTicks: createTicks( waterSeparationRange )
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );

      const soundSeparationRange = new Range( 40, 320 ); // cm
      const soundSeparationControl = new NumberControl(
        slitSeparationString,
        model.soundScene.slitSeparationProperty,
        soundSeparationRange,
        _.extend( {
          delta: 1, // cm
          constrainValue: value => Util.roundToInterval( value, 10 ),
          valuePattern: cmValueString,
          majorTicks: createTicks( soundSeparationRange )
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );

      const lightSeparationRange = new Range( 400, 3200 );
      const lightSeparationControl = new NumberControl(
        slitSeparationString,
        model.lightScene.slitSeparationProperty,
        lightSeparationRange,
        _.extend( {
          delta: 10, // nm
          constrainValue: value => Util.roundToInterval( value, 50 ),
          valuePattern: nmValueString,
          majorTicks: createTicks( lightSeparationRange )
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
      const slitSeparationControl = new ToggleNode( model.sceneProperty, [
        { value: model.waterScene, node: waterSeparationControl },
        { value: model.soundScene, node: soundSeparationControl },
        { value: model.lightScene, node: lightSeparationControl }
      ] );

      barrierTypeDynamicProperty.link( barrierType => {
        const enabled = barrierType === BarrierTypeEnum.TWO_SLITS;
        waterSeparationControl.enabled = enabled;
        soundSeparationControl.enabled = enabled;
        lightSeparationControl.enabled = enabled;
      } );

      // Vertical layout
      slitWidthControl.top = comboBox.bottom + 10;
      slitSeparationControl.top = slitWidthControl.bottom + 14;

      // Horizontal layout
      slitWidthControl.centerX = comboBox.centerX;
      slitSeparationControl.left = slitWidthControl.left;

      const content = alignGroup.createBox( new Node( {
        children: [
          comboBox,
          slitWidthControl,
          slitSeparationControl
        ]
      } ) );

      super( content, {
        maxWidth: WaveInterferenceConstants.PANEL_MAX_WIDTH
      } );
    }
  }

  return waveInterference.register( 'SlitsControlPanel', SlitsControlPanel );
} );