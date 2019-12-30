// Copyright 2019, University of Colorado Boulder

/**
 * Control panel for the DisorderScene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DiffractionNumberControl = require( 'WAVE_INTERFERENCE/diffraction/view/DiffractionNumberControl' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Utils = require( 'DOT/Utils' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferencePanel = require( 'WAVE_INTERFERENCE/common/view/WaveInterferencePanel' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  const circleDiameterString = require( 'string!WAVE_INTERFERENCE/circleDiameter' );
  const disorderString = require( 'string!WAVE_INTERFERENCE/disorder' );
  const latticeSpacingString = require( 'string!WAVE_INTERFERENCE/latticeSpacing' );
  const lotsString = require( 'string!WAVE_INTERFERENCE/lots' );
  const mmValueString = require( 'string!WAVE_INTERFERENCE/mmValue' );
  const noneString = require( 'string!WAVE_INTERFERENCE/none' );

  class DisorderSceneControlPanel extends WaveInterferencePanel {

    /**
     * @param {DisorderScene} disorderScene
     * @param {Object} [options]
     */
    constructor( disorderScene, options ) {
      super( new HBox( {
        spacing: WaveInterferenceConstants.DIFFRACTION_HBOX_SPACING,
        align: 'bottom',
        children: [
          new DiffractionNumberControl( circleDiameterString, disorderScene.diameterProperty, {
            delta: 10E-3,
            numberDisplayOptions: {
              valuePattern: mmValueString,
              decimalPlaces: 2
            },
            sliderOptions: {
              constrainValue: value => Utils.roundToInterval( value, 10E-3 )
            }
          } ),
          new DiffractionNumberControl( latticeSpacingString, disorderScene.latticeSpacingProperty, {
            delta: 10E-3,
            numberDisplayOptions: {
              valuePattern: mmValueString,
              decimalPlaces: 2
            },
            sliderOptions: {
              constrainValue: value => Utils.roundToInterval( value, 10E-3 )
            }
          } ),
          new DiffractionNumberControl( disorderString, disorderScene.disorderProperty, {
            numberDisplayOptions: {
              visible: false
            },
            sliderOptions: {
              majorTicks: [ {
                value: disorderScene.disorderProperty.range.min,
                label: new WaveInterferenceText( noneString, { maxWidth: 60 } )
              }, {
                value: disorderScene.disorderProperty.range.max,
                label: new WaveInterferenceText( lotsString, { maxWidth: 60 } )
              } ],
              minorTickSpacing: 1
            }
          } )
        ]
      } ), options );
    }
  }

  return waveInterference.register( 'DisorderSceneControlPanel', DisorderSceneControlPanel );
} );