/* eslint-disable */
const img = new Image();
window.phetImages.push( img );
img.src = 'data:image/png;base64,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';
export default img;
