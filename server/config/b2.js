const { B2 } = require('backblaze-b2');

// Initialize B2
const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});

// Function to initialize B2 and get authorization
const initB2 = async () => {
  try {
    await b2.authorize();
    console.log('Backblaze B2 authorized successfully');
    return b2;
  } catch (error) {
    console.error('B2 authorization error:', error);
    throw error;
  }
};

// Function to upload file to B2
const uploadToB2 = async (file) => {
  try {
    // Ensure B2 is authorized
    await b2.authorize();
    
    // Get upload URL
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID
    });
    
    // Upload file
    const { data } = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: `${Date.now()}-${file.originalname}`,
      data: file.buffer,
      contentType: file.mimetype
    });
    
    // Return file URL
    return `https://f002.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${data.fileName}`;
  } catch (error) {
    console.error('B2 upload error:', error);
    throw error;
  }
};

module.exports = {
  initB2,
  uploadToB2
};