// Copyright 2018, University of Colorado Boulder

/**
 * For each scene, shows one node for each wave generator, each with its own on/off button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DisturbanceTypeEnum = require( 'WAVE_INTERFERENCE/common/model/DisturbanceTypeEnum' );
  const DisturbanceTypeIconNode = require( 'WAVE_INTERFERENCE/common/view/DisturbanceTypeIconNode' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const RoundStickyToggleButton = require( 'SUN/buttons/RoundStickyToggleButton' );
  const ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  class WaveGeneratorNode extends Node {

    /**
     * @param {WavesModel} model
     * @param {Scene} scene
     * @param {Node} waveAreaNode - for bounds
     * @param {number} buttonPosition - x offset
     * @param {boolean} isPrimarySource
     * @param {Node} sourceNode - for the wave generators, shared with scenery DAG
     * @param {number} [verticalOffset] - offset for the hose, so the water has some distance to fall
     * @param {number} [buttonOffset] - offset for the button, so it can be positioned on the pipe
     * @param {boolean} [showButtonBackground] - true if a new background for the button should be added
     */
    constructor( model, scene, waveAreaNode, buttonPosition, isPrimarySource, sourceNode,
                 verticalOffset = 0,
                 buttonOffset = 0,
                 showButtonBackground = false ) {
      const pulseIcon = new DisturbanceTypeIconNode( DisturbanceTypeEnum.PULSE, { scale: 0.48 } );

      const buttonOptions = {
        centerY: sourceNode.centerY + buttonOffset,
        left: buttonPosition,
        radius: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_RADIUS,
        content: pulseIcon,
        touchAreaDilation: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_TOUCH_AREA_DILATION,
        baseColor: WaveInterferenceConstants.WAVE_GENERATOR_BUTTON_COLOR
      };

      const button = new RoundStickyToggleButton(
        false,
        true,
        isPrimarySource ? scene.button1PressedProperty : scene.button2PressedProperty,
        buttonOptions
      );
      const children = [ sourceNode ];
      if ( showButtonBackground ) {
        const diameter = button.width * 1.3;
        children.push( new ShadedSphereNode( diameter, {
          center: button.center,
          mainColor: '#b1b1b1',
          highlightColor: 'white',
          shadowColor: 'black',
          highlightXOffset: -0.2,
          highlightYOffset: -0.5
        } ) );
      }
      children.push( button );
      const nodeWithButton = new Node( { children: children } );

      const updateEnabled = () => {
        if ( scene.disturbanceTypeProperty.value === DisturbanceTypeEnum.PULSE ) {
          button.enabled = !scene.pulseFiringProperty.value && !scene.isAboutToFireProperty.value;
        }
        else if ( scene.disturbanceTypeProperty.value === DisturbanceTypeEnum.CONTINUOUS ) {
          button.enabled = true;
        }
      };

      // When changing between PULSE and CONTINUOUS, update the buttons.
      scene.disturbanceTypeProperty.link( disturbanceType => {
        pulseIcon.visible = disturbanceType === DisturbanceTypeEnum.PULSE;
          updateEnabled();
        }
      );
      scene.pulseFiringProperty.link( updateEnabled );
      scene.isAboutToFireProperty.link( updateEnabled );
      super( {
        children: [ nodeWithButton ]
      } );

      const modelViewTransform = ModelViewTransform2.createRectangleMapping(
        scene.getWaveAreaBounds(),
        waveAreaNode.bounds
      );

      const sourceSeparationProperty = scene.desiredSourceSeparationProperty || scene.sourceSeparationProperty;
      sourceSeparationProperty.link( sourceSeparation => {

        // Distance between the sources, or 0 if there is only 1 source
        const separation = scene.numberOfSources === 2 ? sourceSeparation : 0;
        if ( !isPrimarySource ) {
          nodeWithButton.visible = separation > 0;
        }
        const sign = isPrimarySource ? 1 : -1;
        const viewSeparation = modelViewTransform.modelToViewDeltaY( separation );

        nodeWithButton.centerY = waveAreaNode.centerY + sign * viewSeparation / 2 + verticalOffset;
      } );
    }
  }

  return waveInterference.register( 'WaveGeneratorNode', WaveGeneratorNode );
} );