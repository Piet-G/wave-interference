// Copyright 2018-2019, University of Colorado Boulder

/**
 * Renders the screen at right hand side of the wave area, showing the time-averaged intensity (for the light scene).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const Color = require( 'SCENERY/util/Color' );
  const ImageDataRenderer = require( 'WAVE_INTERFERENCE/common/view/ImageDataRenderer' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const merge = require( 'PHET_CORE/merge' );
  const PiecewiseLinearFunction = require( 'DOT/PiecewiseLinearFunction' );
  const Utils = require( 'DOT/Utils' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferenceUtils = require( 'WAVE_INTERFERENCE/common/WaveInterferenceUtils' );

  // constants
  const CANVAS_WIDTH = 100;

  // This chooses the saturation point for the screen, as well as the "thinness" of the minima
  const BRIGHTNESS_SCALE_FACTOR = 5;

  // Piecewise linear function optimized for a wide range of brightness, used in Waves Intro sim and Waves screen
  const piecewiseBrightnessFunction = intensity => {
    const brightness = PiecewiseLinearFunction.evaluate( [
      0, 0,
      0.002237089269640335, 0.4,
      0.008937089269640335, 0.5,
      0.05372277438413573, 0.64,
      0.13422634397144692, 0.74,
      0.2096934692889395, 0.8,
      1, 1
    ], intensity );
    return Utils.clamp( brightness, 0, 1 );
  };

  // Linear brightness function optimized for showing interference patterns in the Interference and Slits screens
  const linearBrightnessFunction = intensity => {
    const brightness = Utils.linear( 0, WaveInterferenceConstants.MAX_AMPLITUDE_TO_PLOT_ON_RIGHT, 0, 1, intensity );
    return Utils.clamp( brightness * BRIGHTNESS_SCALE_FACTOR, 0, 1 );
  };

  class LightScreenNode extends CanvasNode {

    /**
     * @param {Lattice} lattice
     * @param {IntensitySample} intensitySample
     * @param {Object} [options]
     */
    constructor( lattice, intensitySample, options ) {
      const latticeCanvasBounds = WaveInterferenceUtils.getCanvasBounds( lattice );
      options = merge( {

        // only use the visible part for the bounds (not the damping regions)
        canvasBounds: new Bounds2( 0, 0, CANVAS_WIDTH, latticeCanvasBounds.height ),
        layerSplit: true, // ensure we're on our own layer
        piecewiseLinearBrightness: false,

        // Use a small window for interference and slits screens, to accentuate the patterns
        // Use a large window for waves-intro and waves screen, to smooth out noise
        lightScreenAveragingWindowSize: 3
      }, options );
      super( options );

      // @private - for the vertical scale factor
      this.latticeCanvasBounds = latticeCanvasBounds;

      // @private
      this.lattice = lattice;

      // @private
      this.piecewiseLinearBrightness = options.piecewiseLinearBrightness;

      // @private
      this.lightScreenAveragingWindowSize = options.lightScreenAveragingWindowSize;

      // @private
      this.intensitySample = intensitySample;

      // @private {Color} required because we'll be operating on a Color
      this.baseColor = new Color( 'blue' );

      // Render into a sub-canvas which will be drawn into the rendering context at the right scale.
      // Use a single column of pixels, then stretch them to the right (since that is a constant)
      const width = 1;

      // @private - for rendering via image data
      this.imageDataRenderer = new ImageDataRenderer( width, lattice.visibleBounds.height );

      // Invalidate paint when model indicates changes
      lattice.changedEmitter.addListener( this.invalidatePaint.bind( this ) );

      // Show it at a 3d perspective, as if orthogonal to the wave view
      const shear = Matrix3.dirtyFromPool().setToAffine( 1, 0, 0, -0.3, 1, 0 );
      this.appendMatrix( shear );

      // After shearing, center on the LatticeNode.  Vertical offset determined empirically.
      this.translate( -CANVAS_WIDTH / 2, 0 );
    }

    /**
     * Sets the color of the peaks of the wave.
     * @param {Color} color
     * @public
     */
    setBaseColor( color ) {
      this.baseColor = color;
      this.invalidatePaint();
    }

    /**
     * Draws into the canvas.
     * @param {CanvasRenderingContext2D} context
     * @public
     * @override
     */
    paintCanvas( context ) {

      const intensityValues = this.intensitySample.getIntensityValues();

      let m = 0;
      const data = this.imageDataRenderer.data;
      const dampY = this.lattice.dampY;
      const height = this.lattice.height;

      // Smoothing for the screen node
      const windowRadius = this.lightScreenAveragingWindowSize;

      for ( let k = dampY; k < height - dampY; k++ ) {

        let sum = intensityValues[ k - this.lattice.dampY ];
        let count = 1;

        // Average within the window, but don't go out of range
        for ( let i = 1; i < windowRadius; i++ ) {
          if ( k - this.lattice.dampY + i < intensityValues.length ) {
            sum = sum + intensityValues[ k - this.lattice.dampY + i ];
            count++;
          }
          if ( k - this.lattice.dampY - i >= 0 ) {
            sum = sum + intensityValues[ k - this.lattice.dampY - i ];
            count++;
          }
        }
        const intensity = sum / count;
        const brightness = this.piecewiseLinearBrightness ?
                           piecewiseBrightnessFunction( intensity ) :
                           linearBrightnessFunction( intensity );

        // Note this interpolation doesn't include the gamma factor that Color.blend does
        const r = this.baseColor.red * brightness;
        const g = this.baseColor.green * brightness;
        const b = this.baseColor.blue * brightness;

        const offset = 4 * m;
        data[ offset ] = r;
        data[ offset + 1 ] = g;
        data[ offset + 2 ] = b;
        data[ offset + 3 ] = 255; // Fully opaque
        m++;
      }
      this.imageDataRenderer.putImageData();

      // draw the sub-canvas to the rendering context at the appropriate scale
      context.save();
      context.transform( 100, 0, 0, this.latticeCanvasBounds.height / this.lattice.visibleBounds.height, 0, 0 );
      context.drawImage( this.imageDataRenderer.canvas, 0, 0 );
      context.restore();
    }
  }

  return waveInterference.register( 'LightScreenNode', LightScreenNode );
} );