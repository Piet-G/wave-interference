// Copyright 2018, University of Colorado Boulder

/**
 * ScreenView for the "Interference" screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const ToggleNode = require( 'SUN/ToggleNode' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );
  const WavesScreenView = require( 'WAVE_INTERFERENCE/waves/view/WavesScreenView' );

  // strings
  const cmValueString = require( 'string!WAVE_INTERFERENCE/cmValue' );
  const nmValueString = require( 'string!WAVE_INTERFERENCE/nmValue' );
  const separationString = require( 'string!WAVE_INTERFERENCE/separation' );

  class InterferenceScreenView extends WavesScreenView {

    /**
     * @param {WavesScreenModel} model
     * @param {AlignGroup} alignGroup - for aligning the control panels on the right side of the lattice
     */
    constructor( model, alignGroup ) {

      const createLabelText = function( string ) {
        return new WaveInterferenceText( string, { fontSize: 10 } );
      };

      const toggleNode = new ToggleNode( [ {
        value: model.waterScene,
        node: new NumberControl( separationString, model.waterScene.sourceSeparationProperty, new Range( 1, 5 ), _.extend( {
          delta: 1,
          valuePattern: cmValueString,
          decimalPlaces: 0,
          majorTicks: [
            { value: 1, label: createLabelText( StringUtils.format( cmValueString, 1 ) ) },
            { value: 5, label: createLabelText( StringUtils.format( cmValueString, 5 ) ) } ]
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) )
      }, {
        value: model.soundScene,
        node: new NumberControl( separationString, model.soundScene.sourceSeparationProperty, new Range( 25, 70 ), _.extend( {
          delta: 5,
          valuePattern: cmValueString,
          majorTicks: [
            { value: 25, label: createLabelText( StringUtils.format( cmValueString, 25 ) ) },
            { value: 70, label: createLabelText( StringUtils.format( cmValueString, 70 ) ) } ]
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) )
      }, {
        value: model.lightScene,
        node: new NumberControl( separationString, model.lightScene.sourceSeparationProperty, new Range( 500, 2500 ), _.extend( {
          delta: 500,
          valuePattern: nmValueString,
          majorTicks: [
            { value: 500, label: createLabelText( StringUtils.format( nmValueString, 500 ) ) },
            { value: 2500, label: createLabelText( StringUtils.format( nmValueString, 2500 ) ) } ]
        }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) )
      } ], model.sceneProperty );
      super( model, alignGroup, {

        // The pulse option does not appear in the Interference screen, because it is distracting and does not meet a
        // specific learning goal in this context.
        showPulseContinuousRadioButtons: false,
        controlPanelOptions: {
          additionalControl: toggleNode
        }
      } );
    }
  }

  return waveInterference.register( 'InterferenceScreenView', InterferenceScreenView );
} );