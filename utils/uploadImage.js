const cloudinary = require('cloudinary').v2

// Cloudinary
const uploadImage = async (path, folder) => {
  try {
    const options = {
      folder: folder,
      resource_type: 'auto',
    }
    // console.log(path.tempFilePath)

    const image = await cloudinary.uploader.upload(path, options);
    return image;
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = uploadImage