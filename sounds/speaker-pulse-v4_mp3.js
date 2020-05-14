/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../chipper/js/grunt/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../chipper/js/grunt/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = simLauncher.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();
const onDecodeSuccess = decodedAudio => {
  wrappedAudioBuffer.audioBuffer = decodedAudio;
  wrappedAudioBuffer.loadedProperty.set( true );
  unlock();
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBuffer = phetAudioContext.createBuffer( 1, 0, phetAudioContext.sampleRate );
  wrappedAudioBuffer.loadedProperty.set( true );
  unlock();
};
phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
export default wrappedAudioBuffer;