// Copyright 2015-2017, University of Colorado Boulder

/**
 * Adapted from charges and fields
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );

  /**
   * @constructor
   */
  function LatticeWebGLNode( lattice ) {
    this.lattice = lattice;

    WebGLNode.call( this, LinesPainter, {
      canvasBounds: new Bounds2( 0, 0, 400, 400 ),
      layerSplit: true // ensure we're on our own layer
    } );

    // Invalidate paint on a bunch of changes
    var invalidateSelfListener = this.invalidatePaint.bind( this );
    lattice.changedEmitter.addListener( invalidateSelfListener );
  }

  waveInterference.register( 'LatticeWebGLNode', LatticeWebGLNode );

  inherit( WebGLNode, LatticeWebGLNode );

  function LinesPainter( gl, node ) {
    this.gl = gl;
    this.node = node;

    // Simple example for custom shader
    var lineVertexShaderSource = [
      // Position
      'attribute vec3 aPosition;',
      'uniform mat3 uModelViewMatrix;',
      'uniform mat3 uProjectionMatrix;',

      'void main( void ) {',
      // homogeneous model-view transformation
      '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
      // homogeneous map to to normalized device coordinates
      '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
      // combine with the z coordinate specified
      '  gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
      '}'
    ].join( '\n' );

    // Simple demo for custom shader
    var lineFragmentShaderSource = [
      'precision mediump float;',

      // Returns the color from the vertex shader
      'void main( void ) {',
      '  gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );',
      '}'
    ].join( '\n' );

    this.shaderProgram = new ShaderProgram( gl, lineVertexShaderSource, lineFragmentShaderSource, {
      attributes: [ 'aPosition' ],
      uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
    } );

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
      0, 0, 0.1,
      50, 30, 0.1
    ] ), gl.STATIC_DRAW );
  }

  inherit( Object, LinesPainter, {
    paint: function( modelViewMatrix, projectionMatrix ) {
      var gl = this.gl;
      var shaderProgram = this.shaderProgram;

      shaderProgram.use();

      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, modelViewMatrix.entries );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, projectionMatrix.entries );

      gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

      gl.drawArrays( gl.LINES, 0, 2 );

      shaderProgram.unuse();

      return WebGLNode.PAINTED_SOMETHING;
    },

    dispose: function() {
      this.shaderProgram.dispose();
      this.gl.deleteBuffer( this.vertexBuffer );

      this.shaderProgram = null;
    }
  } );

  return LatticeWebGLNode;
} );