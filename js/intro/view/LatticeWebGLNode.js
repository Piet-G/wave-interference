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
  var Util = require( 'DOT/Util' );
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
    var lattice = node.lattice;

    // Simple example for custom shader
    var lineVertexShaderSource = [
      // Position
      'attribute vec3 aPosition;',
      'uniform mat3 uModelViewMatrix;',
      'uniform mat3 uProjectionMatrix;',

      'attribute vec4 aColor;',      // New: added vec4 attribute
      'varying vec4 color;',          // New: this will be passed to fragment shader

      'void main( void ) {',
      // homogeneous model-view transformation
      '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
      // homogeneous map to to normalized device coordinates
      '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
      // combine with the z coordinate specified
      '  gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
      '  color=aColor;',
      '}'
    ].join( '\n' );

    // Simple demo for custom shader
    var lineFragmentShaderSource = [
      'precision mediump float;',
      'varying vec4 color;',

      // Returns the color from the vertex shader
      'void main( void ) {',
      '  gl_FragColor = color;',
      '}'
    ].join( '\n' );

    this.shaderProgram = new ShaderProgram( gl, lineVertexShaderSource, lineFragmentShaderSource, {
      attributes: [ 'aPosition', 'aColor' ],
      uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
    } );

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    var vertices = [];
    var cellWidth = 7;

    for ( var i = lattice.dampX; i < node.lattice.width - lattice.dampX; i++ ) {
      for ( var k = lattice.dampY; k < node.lattice.height - lattice.dampY; k++ ) {

        // Top left triangle
        vertices.push( i * cellWidth, k * cellWidth, 0.1 );
        vertices.push( (i + 1) * cellWidth, k * cellWidth, 0.1 );
        vertices.push( i * cellWidth, (k + 1) * cellWidth, 0.1 );

        // Bottom right triangle
        vertices.push( (i + 1) * cellWidth, (k + 1) * cellWidth, 0.1 );
        vertices.push( (i + 1) * cellWidth, k * cellWidth, 0.1 );
        vertices.push( i * cellWidth, (k + 1) * cellWidth, 0.1 );
      }
    }
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

    this.colorBuffer = gl.createBuffer();
  }

  inherit( Object, LinesPainter, {
    paint: function( modelViewMatrix, projectionMatrix ) {
      var gl = this.gl;
      var shaderProgram = this.shaderProgram;
      var node = this.node;
      var lattice = node.lattice;

      shaderProgram.use();

      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, modelViewMatrix.entries );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, projectionMatrix.entries );

      gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
      var colorValues = [];
      for ( var i = lattice.dampX; i < node.lattice.width - lattice.dampX; i++ ) {
        for ( var k = lattice.dampY; k < node.lattice.height - lattice.dampY; k++ ) {
          var value = node.lattice.getCurrentValue( i, k );
          var x = Util.linear( -2, 2, 0, 1, value );

          // rgb for each vertex
          colorValues.push( x );
          colorValues.push( 0 );
          colorValues.push( 0 );

          colorValues.push( x );
          colorValues.push( 0 );
          colorValues.push( 0 );

          colorValues.push( x );
          colorValues.push( 0 );
          colorValues.push( 0 );

          // For bottom triangle
          colorValues.push( x );
          colorValues.push( 0 );
          colorValues.push( 0 );

          colorValues.push( x );
          colorValues.push( 0 );
          colorValues.push( 0 );

          colorValues.push( x );
          colorValues.push( 0 );
          colorValues.push( 0 );
        }
      }
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colorValues ), gl.STATIC_DRAW );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aColor, 3, gl.FLOAT, false, 0, 0 );

      // 3 vertices per triangle and 2 triangles per square
      gl.drawArrays( gl.TRIANGLES, 0, (this.node.lattice.width - lattice.dampX * 2) * (this.node.lattice.height - lattice.dampX * 2) * 3 * 2 );

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