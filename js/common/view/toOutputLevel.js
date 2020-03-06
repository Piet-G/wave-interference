// Copyright 2020, University of Colorado Boulder

import PiecewiseLinearFunction from '../../../../dot/js/PiecewiseLinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import WaveInterferenceQueryParameters from '../WaveInterferenceQueryParameters.js';

/**
 * Converts a wave value to a volume for the WaveMeterNode
 * @param {number} value
 * @returns {number}
 * @author Sam Reid (PhET Interactive Simulations)
 */
const toOutputLevel = value => {

  // Linearize based on the sine value
  const clampedValue = Utils.clamp( value, -1.6, 1.6 );
  const normalized = Utils.linear( -1.6, 1.6, -1, 1, clampedValue );

  // const outputLevel = normalized;
  const arcsin1 = Math.asin( normalized ); // between -pi/2 and +pi/2
  const arcsin1Mapped = Utils.linear( -Math.PI / 2, Math.PI / 2, -1, 1, arcsin1 );
  const arcsin2 = Math.asin( arcsin1Mapped );
  const arcsin2Mapped = Utils.linear( -Math.PI / 2, Math.PI / 2, -1, 1, arcsin2 );

  let outputLevel = Math.abs( arcsin2Mapped );
  // console.log( outputLevel );

  if ( outputLevel < 0.05 ) {
    outputLevel = 0.05;
  }
  if ( outputLevel > 0.4 ) {
    outputLevel = 0.4;
  }

  // Roughly quadratic
  outputLevel = PiecewiseLinearFunction.evaluate( [
    0.05, 0,
    0.1, 0.05,
    0.2, 0.2,
    0.3, 0.5,
    0.4, 1
  ], outputLevel );

  // console.log(outputLevel);

  return outputLevel / 0.15 * WaveInterferenceQueryParameters.waveMeterNodeVolume;
};
export default toOutputLevel;