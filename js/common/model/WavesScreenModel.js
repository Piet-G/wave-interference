// Copyright 2018, University of Colorado Boulder

/**
 * Model for the "Waves" screen and other derivative screens.  This model supports two sources, even though the waves
 * screen only uses one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IntensitySample = require( 'WAVE_INTERFERENCE/common/model/IntensitySample' );
  var Lattice = require( 'WAVE_INTERFERENCE/common/model/Lattice' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var InputTypeEnum = require( 'WAVE_INTERFERENCE/common/model/InputTypeEnum' );
  var PlaySpeedEnum = require( 'WAVE_INTERFERENCE/common/model/PlaySpeedEnum' );
  var Property = require( 'AXON/Property' );
  var SceneTypeEnum = require( 'WAVE_INTERFERENCE/common/model/SceneTypeEnum' );
  var Util = require( 'DOT/Util' );
  var ViewTypeEnum = require( 'WAVE_INTERFERENCE/common/model/ViewTypeEnum' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function WavesScreenModel( options ) {

    options = _.extend( {

      // This model supports one or two sources.  If sourceSeparation is 0, there is only one source
      sourceSeparation: 0
    }, options );

    var self = this;

    // @public
    this.viewTypeProperty = new Property( ViewTypeEnum.TOP, {
      validValues: ViewTypeEnum.VALUES
    } );

    // @public {NumberProperty} the frequency of the emitter
    this.frequencyProperty = new NumberProperty( 10, {
      units: 'hertz'
    } );

    // @public {NumberProperty} controls the amplitude of the wave
    this.amplitudeProperty = new NumberProperty( 7 );

    // @public {NumberProperty} the separation of the wave sources, or 0 if there is only one source
    this.sourceSeparationProperty = new NumberProperty( options.sourceSeparation );

    // @public {BooleanProperty} - whether the wave area graph should be displayed
    this.showGraphProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - whether the screen (on the right of the lattice) should be shown.
    this.showScreenProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - whether the intensity graph (on the right of the lattice) should be shown.
    this.showIntensityGraphProperty = new BooleanProperty( false ); // TODO(design): consistent naming regarding graph/chart.  Design doc says "graph", see https://github.com/phetsims/tasks/issues/927

    // @public {Property.<InputTypeEnum>} - pulse or continuous
    this.inputTypeProperty = new Property( InputTypeEnum.CONTINUOUS, {
      validValues: InputTypeEnum.VALUES
    } );

    // @public {Property.<PlaySpeedEnum>} - the speed at which the simulation is playing
    this.playSpeedProperty = new Property( PlaySpeedEnum.NORMAL, {
      validValues: PlaySpeedEnum.VALUES
    } );

    // @public {BooleanProperty} - whether the model is moving forward in time
    this.isRunningProperty = new BooleanProperty( true );

    // @public {Property.<SceneTypeEnum>} - selected scene
    this.sceneProperty = new Property( SceneTypeEnum.WATER, {
      validValues: SceneTypeEnum.VALUES
    } );

    // @public {BooleanProperty} - whether the measuring tape has been dragged out of the toolbox into the play area
    this.isMeasuringTapeInPlayAreaProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - true if the timer is running
    this.isTimerRunningProperty = new BooleanProperty( false );

    // @public {NumberProperty} - time elapsed on the timer since it was last restarted
    this.timerElapsedTimeProperty = new NumberProperty( 0, {
      units: 'seconds'
    } );

    // @public {BooleanProperty} - true if the timer has been dragged out of the toolbox into the play area
    this.isTimerInPlayAreaProperty = new BooleanProperty( false );

    // @public
    this.isChartToolNodeInPlayAreaProperty = new BooleanProperty( false );

    // @public - amount the 3d view is rotated. 0 means top view, 1 means side view.
    this.rotationAmountProperty = new NumberProperty( 0, {
      range: { min: 0, max: 1 }
    } );

    // @public {Emitter} - emits once per step
    this.stepEmitter = new Emitter();

    // @public {BooleanProperty} - true while a single pulse is being generated
    this.pulseFiringProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - true when the first source is continuously oscillating
    this.continuousWave1OscillatingProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - true when the second source is continuously oscillating
    this.continuousWave2OscillatingProperty = new BooleanProperty( false );

    // @public {Lattice} the grid that contains the wave values
    this.lattice = new Lattice( 100, 100, 20, 20 ); // Java was 60 + 20 padding on each side // TODO(design): evaluate dimensions

    // @public {IntensitySample} reads out the intensity on the right hand side of the lattice
    this.intensitySample = new IntensitySample( this.lattice );

    // @public - wavelength in nm
    this.wavelengthProperty = new Property( 400 );

    // Bidirectional mapping for physical coordinates.  Update the wavelength first so it will take the correct
    // initial value.
    // TODO: if there is numerical/roundoff error, we could get an infinite loop
    // TODO(design): the wavelength slider goes from high frequency to low frequency.  Should we invert it so it
    // matches the other sliders?
    // TODO(design): I like having frequency = 0 as an option, but that won't work for "red"--shouldn't be zero exactly.
    // TODO(design): Do we need to match the relative wavelengths of the colors?  For instance, if blue was half the wavelength of red
    // that wouldn't be reflected properly here
    this.frequencyProperty.link( function( frequency ) {
      self.wavelengthProperty.set( Util.linear( WaveInterferenceConstants.MINIMUM_FREQUENCY, WaveInterferenceConstants.MAXIMUM_FREQUENCY, VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH, frequency ) );
    } );
    this.wavelengthProperty.link( function( wavelength ) {
      self.frequencyProperty.set( Util.linear( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH, WaveInterferenceConstants.MINIMUM_FREQUENCY, WaveInterferenceConstants.MAXIMUM_FREQUENCY, wavelength ) );
    } );

    // @public {number} elapsed time in seconds
    this.time = 0;

    // @public {number} phase of the emitter
    this.phase = 0;

    // @private - track the time since the last lattice update so we can get comparable performance on machines with different speeds
    this.timeSinceLastLatticeStep = 0;

    // When frequency changes, choose a new phase such that the new sine curve has the same value and direction
    // for continuity
    this.frequencyProperty.lazyLink( function( newFrequency, oldFrequency ) {
      var oldValue = Math.sin( self.time * oldFrequency + self.phase );
      var proposedPhase = Math.asin( oldValue ) - self.time * newFrequency;
      var oldDerivative = Math.cos( self.time * oldFrequency + self.phase );
      var newDerivative = Math.cos( self.time * newFrequency + proposedPhase );

      // If wrong phase, take the sin value from the opposite side and move forward by half a cycle
      if ( oldDerivative * newDerivative < 0 ) {
        proposedPhase = Math.asin( -oldValue ) - self.time * newFrequency + Math.PI;
      }

      self.phase = proposedPhase;

      // The wave area resets when the wavelength changes in the light scene
      if ( self.sceneProperty.get() === SceneTypeEnum.LIGHT ) {
        self.clear();
      }
    } );

    // When the scene changes, the wave clears
    this.sceneProperty.link( function() {
      self.clear();
    } );
  }

  waveInterference.register( 'WavesScreenModel', WavesScreenModel );

  return inherit( Object, WavesScreenModel, {

    /**
     * Clears the wave and the Intensity Sample
     * @public
     */
    clear: function() {
      this.lattice.clear();
      this.intensitySample.clear();
    },

    /**
     * Advance time by the specified amount
     * @param {number} dt - amount of time in seconds to move the model forward
     * @public
     */
    step: function( dt ) {

      // Animate the rotation, if it needs to rotate.  This is not subject to being paused, because we would like
      // students to be able to see the side view, pause it, then switch to the corresponding top view, and vice versa.
      var sign = this.viewTypeProperty.get() === ViewTypeEnum.TOP ? -1 : +1;
      var newRotationAmount = Util.clamp( this.rotationAmountProperty.value + dt * sign * 1.4, 0, 1 );
      this.rotationAmountProperty.value = newRotationAmount;

      if ( this.isRunningProperty.get() ) {
        this.advanceTime( dt * this.playSpeedProperty.get().scaleFactor );
      }
    },

    /**
     * Additionally called from the "step" button
     * @param {number} dt - amount of time in seconds to move the model forward
     * @public
     */
    advanceTime: function( dt ) {

      // On iPad2 and slower platforms, the clock speed cannot keep up with the frequency, so we must clamp the elapsed
      // time to get the full range of oscillation at the wave source.
      if ( dt > 1 / 60 ) {
        dt = 1 / 60;
      }
      this.time += dt;
      var continuous1 = ( this.inputTypeProperty.get() === InputTypeEnum.CONTINUOUS ) && this.continuousWave1OscillatingProperty.get();
      var continuous2 = ( this.inputTypeProperty.get() === InputTypeEnum.CONTINUOUS ) && this.continuousWave2OscillatingProperty.get();
      if ( continuous1 || continuous2 || this.pulseFiringProperty.get() ) {

        // TODO(design): a negative sign here will mean the water goes down first for a pulse, which makes sense
        // for a drop of water dropping in, but not desirable for how the graphs look (seems odd to dip down first)
        var v = -Math.sin( this.time * this.frequencyProperty.value + this.phase ) * this.amplitudeProperty.get();
        var separation = Math.floor( this.sourceSeparationProperty.get() / 2 );

        // Named with a "J" suffix instead of "Y" to remind us we are working in integral (i,j) lattice coordinates.
        var latticeCenterJ = Math.floor( this.lattice.height / 2 );

        // Point source
        if ( this.continuousWave1OscillatingProperty.get() ) {
          this.lattice.setCurrentValue( 30, latticeCenterJ - separation, v );
        }

        // Secondary source, if any
        // TODO: symmetry between waves
        if ( separation > 0 && this.continuousWave2OscillatingProperty.get() ) {
          this.lattice.setCurrentValue( 30, latticeCenterJ + separation, v );
        }

        if ( this.time * this.frequencyProperty.value + this.phase > Math.PI * 2 ) {
          this.pulseFiringProperty.value = false;
        }
      }

      this.timeSinceLastLatticeStep += dt;

      if ( this.timeSinceLastLatticeStep >= 1 / 60 ) {
        this.lattice.step();
        this.timeSinceLastLatticeStep = 0;
        this.intensitySample.step();
      }
      if ( this.isTimerRunningProperty.get() ) {
        this.timerElapsedTimeProperty.set( this.timerElapsedTimeProperty.get() + dt );
      }

      // Notify listeners that a frame has advanced
      this.stepEmitter.emit();
    },

    /**
     * Start a single pulse when the user presses the pulse button in pulse mode.
     */
    startPulse: function() {
      assert && assert( !this.pulseFiringProperty.value, 'Cannot fire a pulse while a pulse is already being fired' );
      this.phase = -this.time * this.frequencyProperty.value; // start the sine angle at 0
      this.pulseFiringProperty.value = true;
    },

    /**
     * Restores the initial conditions
     * @public
     */
    reset: function() {

      // Reset frequencyProperty first because it changes the time and phase
      this.frequencyProperty.reset();
      this.time = 0;
      this.phase = 0;
      this.lattice.clear();
      this.sceneProperty.reset();
      this.viewTypeProperty.reset();
      this.frequencyProperty.reset();
      this.amplitudeProperty.reset();
      this.showGraphProperty.reset();
      this.inputTypeProperty.reset();
      this.playSpeedProperty.reset();
      this.isRunningProperty.reset();
      this.showScreenProperty.reset();
      this.rotationAmountProperty.reset();
      this.isTimerInPlayAreaProperty.reset();
      this.showIntensityGraphProperty.reset();
      this.timerElapsedTimeProperty.reset();
      this.isMeasuringTapeInPlayAreaProperty.reset();
      this.isChartToolNodeInPlayAreaProperty.reset();
    }
  } );
} );