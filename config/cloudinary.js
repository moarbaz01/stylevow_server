const cloudinary = require('cloudinary').v2

const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    })
    console.log("Cloudinary connected successfully")
}

module.exports = connectCloudinary