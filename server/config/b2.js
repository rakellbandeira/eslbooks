// Import the B2 class properly
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
const uploadToB2 = async (file, folder = '') => {
  try {
    // Ensure B2 is authorized
    await b2.authorize();
    
    // Create filename with folder structure if provided
    const fileName = folder 
      ? `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
      : `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    // Get upload URL
    const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID
    });
    
    // Upload file
    const { data } = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
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

// Function to delete file from B2
const deleteFromB2 = async (fileUrl) => {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split(`/${process.env.B2_BUCKET_NAME}/`)[1];
    
    if (!fileName) {
      throw new Error('Invalid file URL');
    }
    
    // Ensure B2 is authorized
    await b2.authorize();
    
    // Get file info to get file ID
    const { data: files } = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      startFileName: fileName,
      maxFileCount: 1
    });
    
    if (files.files.length === 0 || files.files[0].fileName !== fileName) {
      throw new Error('File not found');
    }
    
    const fileId = files.files[0].fileId;
    
    // Delete file
    await b2.deleteFileVersion({
      fileId,
      fileName
    });
    
    return true;
  } catch (error) {
    console.error('B2 delete error:', error);
    throw error;
  }
};

module.exports = {
  initB2,
  uploadToB2,
  deleteFromB2
};