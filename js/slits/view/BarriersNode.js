// Copyright 2018, University of Colorado Boulder

/**
 * Shows the water from the side view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BarrierTypeEnum = require( 'WAVE_INTERFERENCE/slits/model/BarrierTypeEnum' );
  var DragListener = require( 'SCENERY/listeners/DragListener' );
  var DynamicProperty = require( 'AXON/DynamicProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SlitsScreenModel = require( 'WAVE_INTERFERENCE/slits/model/SlitsScreenModel' );
  var Util = require( 'DOT/Util' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );

  // constants
  var BARRIER_WIDTH_IN_CELLS = 1;

  /**
   * @param {SlitsScreenModel} model
   * @param {Scene} scene
   * @param {Bounds2} waveAreaBounds
   * @constructor
   */
  function BarriersNode( model, scene, waveAreaBounds ) {

    assert && assert( model instanceof SlitsScreenModel );

    // @private
    this.waveAreaBounds = waveAreaBounds;

    // @private
    this.model = model;

    Node.call( this, {
      cursor: 'pointer'
    } );

    // @private - Convert from lattice coordinates to view coordinates
    this.latticeViewTransform = ModelViewTransform2.createRectangleMapping( this.model.lattice.getVisibleBounds(), waveAreaBounds );

    this.addInputListener( new DragListener( {
      applyOffset: false,
      locationProperty: scene.barrierLocationProperty,
      transform: this.latticeViewTransform
    } ) );

    // Update shapes when the model parameters change
    var update = this.update.bind( this );
    model.barrierTypeProperty.link( update );
    model.waterScene.barrierLocationProperty.link( update );
    model.soundScene.barrierLocationProperty.link( update );
    model.lightScene.barrierLocationProperty.link( update );
    model.waterScene.slitWidthProperty.link( update );
    model.soundScene.slitWidthProperty.link( update );
    model.lightScene.slitWidthProperty.link( update );
    model.waterScene.slitSeparationProperty.link( update );
    model.soundScene.slitSeparationProperty.link( update );
    model.lightScene.slitSeparationProperty.link( update );
  }

  waveInterference.register( 'BarriersNode', BarriersNode );

  return inherit( Node, BarriersNode, {

    /**
     * @private - update the shapes and text when the rotationAmount has changed
     */
    update: function() {

      // TODO(performance): iPad2 performance check--is it OK to remove and recreate nodes while dragging a slider?
      // TODO(performance): if necessary, we could create 3 rectangles on startup and reuse them.
      this.removeAllChildren();
      var barrierType = this.model.barrierTypeProperty.get();
      var lattice = this.model.lattice;
      var dampY = lattice.dampY;
      var slitWidth = this.model.sceneProperty.get().slitWidthProperty.get();
      var slitSeparation = this.model.sceneProperty.get().slitSeparationProperty.get();

      var x1 = this.latticeViewTransform.modelToViewX( this.model.getBarrierLocation() );
      var x2 = this.latticeViewTransform.modelToViewX( this.model.getBarrierLocation() + BARRIER_WIDTH_IN_CELLS );

      if ( barrierType === BarrierTypeEnum.NO_BARRIER ) {

        // No need to add children
      }
      else if ( barrierType === BarrierTypeEnum.ONE_SLIT ) {
        var y1 = Util.linear( dampY, lattice.height - dampY - 1, this.waveAreaBounds.top, this.waveAreaBounds.bottom, lattice.height / 2 - slitWidth / 2 );
        var y2 = Util.linear( dampY, lattice.height - dampY - 1, this.waveAreaBounds.top, this.waveAreaBounds.bottom, lattice.height / 2 + slitWidth / 2 );
        this.addChild( new Rectangle( x1, this.waveAreaBounds.top, x2 - x1, y1 - this.waveAreaBounds.top, 2, 2, {
          fill: '#f3d99b',
          stroke: 'black',
          lineWidth: 1
        } ) );
        this.addChild( new Rectangle( x1, y2, x2 - x1, this.waveAreaBounds.bottom - y2, 2, 2, {
          fill: '#f3d99b',
          stroke: 'black',
          lineWidth: 1
        } ) );
      }
      else if ( barrierType === BarrierTypeEnum.TWO_SLITS ) {

        var bottomOfTopBarrier = this.latticeViewTransform.modelToViewY( lattice.height / 2 - slitSeparation / 2 - slitWidth / 2 );
        var topOfCentralBarrier = this.latticeViewTransform.modelToViewY( lattice.height / 2 - slitSeparation / 2 + slitWidth / 2 );
        var bottomOfCentralBarrier = this.latticeViewTransform.modelToViewY( lattice.height / 2 + slitSeparation / 2 - slitWidth / 2 );
        var topOfBottomBarrier = this.latticeViewTransform.modelToViewY( lattice.height / 2 + slitSeparation / 2 + slitWidth / 2 );
        this.addChild( new Rectangle( x1, this.waveAreaBounds.top, x2 - x1, Math.max( 0, bottomOfTopBarrier - this.waveAreaBounds.top ), 2, 2, {
          fill: '#f3d99b',
          stroke: 'black',
          lineWidth: 1
        } ) );
        this.addChild( new Rectangle( x1, topOfCentralBarrier, x2 - x1, Math.max( bottomOfCentralBarrier - topOfCentralBarrier, 0 ), 2, 2, {
          fill: '#f3d99b',
          stroke: 'black',
          lineWidth: 1
        } ) );
        this.addChild( new Rectangle( x1, topOfBottomBarrier, x2 - x1, Math.max( this.waveAreaBounds.bottom - topOfBottomBarrier ), 2, 2, {
          fill: '#f3d99b',
          stroke: 'black',
          lineWidth: 1
        } ) );
      }
    }
  } );
} );