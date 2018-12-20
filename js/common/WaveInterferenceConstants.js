// Copyright 2018, University of Colorado Boulder

/**
 * Constants for the Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  const Color = require( 'SCENERY/util/Color' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  // constants
  const THUMB_SIZE = new Dimension2( 13, 22 );
  const DEFAULT_FONT_SIZE = 15;
  const DEFAULT_FONT = new PhetFont( DEFAULT_FONT_SIZE );
  const MAJOR_TICK_LENGTH = 12;

  const WaveInterferenceConstants = {
    WAVE_AREA_WIDTH: 500,
    MAJOR_TICK_LENGTH: MAJOR_TICK_LENGTH,

    // For NumberControls and WaveInterferenceSliders
    TICK_FONT_SIZE: 11.5,

    // Values the amplitude can take
    AMPLITUDE_RANGE: new Range( 0, 10 ),

    // These constants are used for the NumberControls to give them a consistent looks
    NUMBER_CONTROL_OPTIONS: {
      trackSize: new Dimension2( 100, 1 ),
      valueFont: new PhetFont( 13 ),
      majorTickLength: MAJOR_TICK_LENGTH,
      thumbSize: THUMB_SIZE,
      layoutFunction: NumberControl.createLayoutFunction4( { verticalSpacing: 3 } ),
      arrowButtonOptions: {
        scale: 0.65
      },
      titleFont: DEFAULT_FONT,
      titleMaxWidth: 95,
      valueMaxWidth: 65
    },
    THUMB_SIZE: THUMB_SIZE,
    DEFAULT_FONT: DEFAULT_FONT,
    WATER_SIDE_COLOR: new Color( '#58c0fa' ),

    // The IntensityGraphPanel and LightScreenNode have a shared maximum, this value indicates the wave amplitude that
    // maps to the highest value on the chart or brightest node in the LightScreenNode. If the source amplitude or
    // attenuation as altered, this would likely need to change.  When tuning this, use a reddish wavelength because
    // for unknown reasons it yields a higher output amplitude
    MAX_AMPLITUDE_TO_PLOT_ON_RIGHT: 2.14,

    // Size of a cell in view coordinates
    CELL_WIDTH: 10,

    // lineJoin for the graph and the surface of the water
    CHART_LINE_JOIN: 'round',

    // Look of the wave generator button across all 3 scenes
    CONTINUOUS_DISTURBANCE_BUTTON_COLOR: 'red',
    PULSE_DISTURBANCE_BUTTON_COLOR: '#33dd33',
    WAVE_GENERATOR_BUTTON_RADIUS: 14,
    WAVE_GENERATOR_BUTTON_TOUCH_AREA_DILATION: 8,

    FEMTO: 1E-15,

    // Cell that oscillates, specified as an offset from the origin of the lattice (includes damping region).
    POINT_SOURCE_HORIZONTAL_COORDINATE: 23,

    // The lattice must have an odd dimension, so that there can be a cell exactly in the middle (for a single-cell
    // oscillator), symmetry for the two oscillator screen, and so the 1-cell wide barrier can appear directly in the
    // middle of the lattice.  See https://github.com/phetsims/wave-interference/issues/167
    LATTICE_DIMENSION: 101,

    // Number of cells around the boundary of the lattice to avoid reflections at the edge
    LATTICE_PADDING: 20,

    // maxWidth for the right hand side panels
    PANEL_MAX_WIDTH: 200,

    // maxWidth for slider ticks
    TICK_MAX_WIDTH: 30,

    // Use for the time and length scale texts above the wave area, looks best to be a smidge smaller than the
    // rest of the texts
    TIME_AND_LENGTH_SCALE_INDICATOR_FONT: new PhetFont( DEFAULT_FONT_SIZE - 1 )
  };

  assert && assert( WaveInterferenceConstants.LATTICE_DIMENSION % 2 === 1, 'lattice dimension must be odd' );

  waveInterference.register( 'WaveInterferenceConstants', WaveInterferenceConstants );

  return WaveInterferenceConstants;
} );