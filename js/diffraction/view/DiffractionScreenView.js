// Copyright 2017, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LaserPointerNode = require( 'SCENERY_PHET/LaserPointerNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  // constants
  var width = 256;
  var height = width;

  /**
   * @param {number} x0
   * @param {number} y0
   * @param {number} sigmaX
   * @param {number} sigmaY
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  function gaussian( x0, y0, sigmaX, sigmaY, x, y ) {
    var dx = x - x0;
    var dy = y - y0;
    var a = dx * dx / sigmaX / sigmaX;
    var b = dy * dy / sigmaY / sigmaY;
    return Math.pow( Math.E, -(a + b) / 2 );
  }

  /**
   * @param {WaveInterferenceModel} diffractionModel
   * @constructor
   */
  function DiffractionScreenView( diffractionModel ) {

    var self = this;
    ScreenView.call( this );

    this.onProperty = new Property( true );
    var laserPointerNode = new LaserPointerNode( this.onProperty, {
      left: 10, centerY: 50
    } );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        diffractionModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    this.squareWidthProperty = new Property( 10 );
    this.squareHeightProperty = new Property( 10 );

    this.numberOfLinesProperty = new Property( 10 );
    this.angleProperty = new Property( 0 );

    this.sigmaXProperty = new Property( 10 );
    this.sigmaYProperty = new Property( 10 );
    this.gaussianMagnitudeProperty = new Property( 400 ); // TODO: is this useful for students?

    this.sceneProperty = new Property( 'rectangle' );
    var toggleButtonsContent = [ {
      value: 'rectangle',
      node: new Rectangle( 0, 0, 20, 20, { fill: 'black' } )
    }, {
      value: 'circle',
      node: new Circle( 10, { fill: 'black' } )
    }, {
      value: 'slits',
      node: new HBox( {
        spacing: 2,
        children: _.range( 1, 8 ).map( function( r ) {
          return new Rectangle( 0, 0, 2, 20, { fill: 'black' } );
        } )
      } )
    } ];
    var radioButtonGroup = new RadioButtonGroup( this.sceneProperty, toggleButtonsContent, {
      left: 10,
      bottom: this.layoutBounds.bottom - 10
    } );

    this.placeholderImage = document.createElement( 'canvas' );
    this.placeholderImage.width = width;
    this.placeholderImage.height = height;

    var context = this.placeholderImage.getContext( '2d' );
    context.fillStyle = 'black';
    context.fillRect( 0, 0, width, height );

    var imageScale = 1.5;
    this.apertureImage = new Image( this.placeholderImage, { scale: imageScale, top: 100, left: 140 } );
    self.addChild( this.apertureImage );


    this.diffractionImage = new Image( this.placeholderImage, {
      right: this.layoutBounds.right - 10,
      scale: imageScale,
      top: 100
    } );
    self.addChild( this.diffractionImage );

    var ICON_SCALE = 0.2;
    this.apertureIcon = new Image( this.placeholderImage, {
      scale: ICON_SCALE,
      centerY: laserPointerNode.centerY,
      centerX: this.apertureImage.centerX,
      matrix: Matrix3.affine( 1, 0.25,
        0, 1,
        0, 0 )
    } );

    this.diffractionIcon = new Image( this.placeholderImage, {
      scale: ICON_SCALE,
      centerY: laserPointerNode.centerY,
      centerX: this.diffractionImage.centerX,
      matrix: Matrix3.affine( 1, 0.25,
        0, 1,
        0, 0 )
    } );
    self.addChild( this.diffractionIcon );

    var updateCanvases = function() {
      self.updateCanvases();
    };
    this.sceneProperty.lazyLink( updateCanvases );

    this.addChild( radioButtonGroup );

    this.squareWidthProperty.lazyLink( updateCanvases );
    this.squareHeightProperty.lazyLink( updateCanvases );
    this.sigmaXProperty.lazyLink( updateCanvases );
    this.sigmaYProperty.lazyLink( updateCanvases );
    this.onProperty.lazyLink( updateCanvases );
    this.numberOfLinesProperty.lazyLink( updateCanvases );
    this.angleProperty.lazyLink( updateCanvases );
    this.gaussianMagnitudeProperty.lazyLink( updateCanvases );
    this.squareControlPanel = new Panel( new VBox( {
      children: [
        new NumberControl( 'width', this.squareWidthProperty, new Range( 2, 100 ), {
          delta: 2 // avoid odd/even artifacts
        } ),
        new NumberControl( 'height', this.squareHeightProperty, new Range( 2, 100 ), {
          delta: 2 // avoid odd/even artifacts
        } ) ]
    } ), {
      centerTop: this.apertureImage.centerBottom.plusXY( 0, 5 )
    } );
    this.addChild( this.squareControlPanel );

    this.gaussianControlPanel = new Panel( new HBox( {
      children: [
        new VBox( {
          children: [
            new NumberControl( 'sigmaX', this.sigmaXProperty, new Range( 2, 40 ) ),
            new NumberControl( 'sigmaY', this.sigmaYProperty, new Range( 2, 40 ) )
          ]
        } ), new NumberControl( 'magnitude', this.gaussianMagnitudeProperty, new Range( 1, 1000 ) ) ],
    } ), {
      leftTop: this.apertureImage.leftBottom.plusXY( 0, 5 )
    } );
    this.addChild( this.gaussianControlPanel );

    this.slitsControlPanel = new Panel( new VBox( {
      children: [
        new NumberControl( 'number of lines', this.numberOfLinesProperty, new Range( 2, 200 ) ),
        new NumberControl( 'angle', this.angleProperty, new Range( 0, Math.PI * 2 ), {
          delta: 0.01
        } )
      ]
    } ), {
      leftTop: this.apertureImage.leftBottom.plusXY( 0, 5 )
    } );
    this.addChild( this.slitsControlPanel );

    this.sceneProperty.link( function( scene ) {
      self.squareControlPanel.visible = scene === 'rectangle';
      self.gaussianControlPanel.visible = scene === 'circle';
      self.slitsControlPanel.visible = scene === 'slits';
    } );

    var beamWidth = 40;
    var incidentBeam = new Rectangle( laserPointerNode.right, laserPointerNode.centerY - beamWidth / 2, this.apertureIcon.centerX - laserPointerNode.right, beamWidth, {
      fill: 'gray',
      opacity: 0.7
    } );

    var transmittedBeam = new Rectangle( this.apertureIcon.centerX, laserPointerNode.centerY - beamWidth / 2, this.diffractionIcon.centerX - this.apertureIcon.centerX, beamWidth, {
      fill: 'gray',
      opacity: 0.7
    } );

    this.onProperty.linkAttribute( incidentBeam, 'visible' );
    this.onProperty.linkAttribute( transmittedBeam, 'visible' );

    this.addChild( transmittedBeam );
    self.addChild( this.apertureIcon );
    this.addChild( incidentBeam );
    this.addChild( laserPointerNode );

    updateCanvases();
  }

  waveInterference.register( 'DiffractionScreenView', DiffractionScreenView );

  return inherit( ScreenView, DiffractionScreenView, {

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    // @public
    step: function( dt ) {
      //TODO Handle view animation here.
    },

    updateCanvases: function() {

      // Usage code from JS-Fourier-Image-Analysis/js/main.js
      var dims = [ width, height ]; // will be set later
      var cc = 9e-3; // contrast constant
      var apertureCanvas;
      var diffractionCanvas;
      var diffractionContext;

      var start = +new Date();
      // make each canvas the image's exact size
      apertureCanvas = document.createElement( 'canvas' );
      apertureCanvas.width = dims[ 0 ];
      apertureCanvas.height = dims[ 1 ];
      var apertureContext = apertureCanvas.getContext( '2d' );

      diffractionCanvas = document.createElement( 'canvas' );
      diffractionCanvas.width = dims[ 0 ];
      diffractionCanvas.height = dims[ 1 ];
      diffractionContext = diffractionCanvas.getContext( '2d' );

      apertureContext.fillStyle = 'black';
      apertureContext.fillRect( 0, 0, width, height );

      apertureContext.fillStyle = 'white';

      var i;

      if ( this.sceneProperty.value === 'rectangle' ) {
        var rectWidth = this.squareWidthProperty.value;
        var rectHeight = this.squareHeightProperty.value;
        apertureContext.fillRect( width / 2 - rectWidth / 2, width / 2 - rectHeight / 2, rectWidth, rectHeight );
      }
      else if ( this.sceneProperty.value === 'circle' ) {
        for ( i = 0; i < width; i++ ) {
          for ( var k = 0; k < height; k++ ) {
            var v = Util.clamp( Math.floor( gaussian( width / 2, height / 2, this.sigmaXProperty.value, this.sigmaYProperty.value, i, k ) * this.gaussianMagnitudeProperty.value ), 0, 255 );
            apertureContext.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
            apertureContext.fillRect( i, k, 1, 1 );
          }
        }
      }
      else if ( this.sceneProperty.value === 'slits' ) {

        apertureContext.rotate( this.angleProperty.value );
        var slitWidth = 1;
        var numberOfLines = this.numberOfLinesProperty.value;
        var lineSpacing = width / (numberOfLines + 1);

        // Even number of lines
        if ( numberOfLines % 2 === 0 ) {

          for ( i = 0; i < numberOfLines / 2; i++ ) {
            apertureContext.fillRect( width / 2 + i * lineSpacing + lineSpacing / 2, -1000, slitWidth, 2000 );
            apertureContext.fillRect( width / 2 - i * lineSpacing - lineSpacing / 2, -1000, slitWidth, 2000 );
          }
        }
        else {

          // odd number of lines
          for ( i = 0; i < numberOfLines / 2; i++ ) {
            apertureContext.fillRect( width / 2 + i * lineSpacing, -1000, slitWidth, 2000 );
            if ( i !== 0 ) { // only draw central line once
              apertureContext.fillRect( width / 2 - i * lineSpacing, -1000, slitWidth, 2000 );
            }
          }
        }
      }

      // circle
      // apertureContext.beginPath();
      // apertureContext.arc( 75, 75, 5, 0, 2 * Math.PI );
      // apertureContext.fill();

      // grab the pixels
      var imageData = apertureContext.getImageData( 0, 0, dims[ 0 ], dims[ 1 ] );
      var h_es = []; // the h values
      for ( var ai = 0; ai < imageData.data.length; ai += 4 ) {

        // greyscale, so you only need every 4th value
        h_es.push( imageData.data[ ai ] );
      }

      // initialize the h values
      var h = function( n, m ) {
        if ( arguments.length === 0 ) {
          return h_es;
        }

        var idx = n * dims[ 0 ] + m;
        return h_es[ idx ];
      }; // make it a function so the code matches the math

      var duration = +new Date() - start;
      console.log( 'It took ' + duration + 'ms to draw the image.' );

      start = +new Date();

      // compute the h hat values
      var h_hats = [];
      Fourier.transform( h(), h_hats );
      h_hats = Fourier.shift( h_hats, dims );

      // get the largest magnitude
      var maxMagnitude = 0;
      for ( ai = 0; ai < h_hats.length; ai++ ) {
        var mag = h_hats[ ai ].magnitude();
        if ( mag > maxMagnitude ) {
          maxMagnitude = mag;
        }
      }

      Fourier.filter( h_hats, dims, NaN, NaN );

      // store them in a nice function to match the math
      var $h = function( k, l ) {
        if ( arguments.length === 0 ) {
          return h_hats;
        }

        var idx = k * dims[ 0 ] + l;
        return h_hats[ idx ];
      };

      // draw the pixels
      var currImageData = diffractionContext.getImageData( 0, 0, dims[ 0 ], dims[ 1 ] );
      var logOfMaxMag = Math.log( cc * maxMagnitude + 1 );
      for ( k = 0; k < dims[ 1 ]; k++ ) {
        for ( var l = 0; l < dims[ 0 ]; l++ ) {
          var idxInPixels = 4 * (dims[ 0 ] * k + l);
          currImageData.data[ idxInPixels + 3 ] = 255; // full alpha
          var color = Math.log( cc * $h( k, l ).magnitude() + 1 );
          color = Math.round( 255 * (color / logOfMaxMag) );
          // RGB are the same -> gray
          for ( var c = 0; c < 3; c++ ) { // lol c++
            currImageData.data[ idxInPixels + c ] = color;
          }
        }
      }
      diffractionContext.putImageData( currImageData, 0, 0 );

      this.apertureImage.image = apertureCanvas;
      this.diffractionImage.image = this.onProperty.value ? diffractionCanvas : this.placeholderImage;

      this.apertureIcon.image = apertureCanvas;
      this.diffractionIcon.image = this.onProperty.value ? diffractionCanvas : this.placeholderImage;

      duration = +new Date() - start;
      console.log( 'It took ' + duration + 'ms to compute the FT.' );
    }
  } );
} );