const { Jimp } = require('jimp');

async function createDarkIcon() {
  try {
    // Load the original image
    const image = await Jimp.read('./images/BurnerBoardIcon-1026.png');
    
    // Process each pixel
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];
      
      // Check if pixel is white or light (RGB values > 200)
      if (red > 200 && green > 200 && blue > 200 && alpha > 100) {
        // Replace with dark gray
        this.bitmap.data[idx + 0] = 40;  // Red
        this.bitmap.data[idx + 1] = 40;  // Green
        this.bitmap.data[idx + 2] = 40;  // Blue
        // Keep alpha the same
      }
    });
    
    // Save the processed image
    await image.write('./images/BurnerBoardIcon-1026-dark.png');
    console.log('Successfully created dark version: ./images/BurnerBoardIcon-1026-dark.png');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

createDarkIcon();
