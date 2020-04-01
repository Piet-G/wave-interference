/* eslint-disable */
const img = new Image();
window.phetImages.push( img );
img.src = 'data:image/png;base64,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';
export default img;
