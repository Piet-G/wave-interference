// Copyright 2016, University of Colorado Boulder

/**
 * Selects whether the wave is shown from the top (default) or side view.  This value represents the user selection--
 * the view animates between the selections.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  const ViewType = {
    TOP: 'TOP',
    SIDE: 'SIDE'
  };

  ViewType.VALUES = _.values( ViewType );

  // in development mode, catch any attempted changes to the enum
  if ( assert ) { Object.freeze( ViewType ); }

  return waveInterference.register( 'ViewType', ViewType );
} );