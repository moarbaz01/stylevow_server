const Category = require("../models/Category");
const uploadImage = require("../utils/uploadImage");

exports.create = async (req, res) => {
    try {
        // FETCH DATA
        const { name } = req.body;
        const image = req.file;
        let newImage;
        console.log(image)
        if(!image){
            res.status(500).json({
                success: false,
                message: "IMAGE REQUIRED",

            })
        }else{
         newImage = await uploadImage(image.path, "CATEGORY");
        }

        // Upload image
        

        if (!name) {
            res.status(500).json({
                message: "NAME FIELD REQUIRED",
            });
        }

        // SAVE
        const category = new Category({
            name,
            image: newImage.secure_url,
        });

        const data = await category.save();

        res.status(200).json({
            success: true,
            message: "CATEGORY SUCCESSFULLY CREATED",
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ERROR OCCUR IN CATEGORY CREATION",
            error: error.message
        });
    }
};

// UPDATE 
exports.update = async (req, res) => {
    try {
        // FETCH DATA
        const { name, id } = req.body;
        // If image
        let image;
        if(req.file){
            const newImage = await uploadImage(req.file.path, "CATEGORY");
            image = newImage.secure_url;
        } 

        if (!name) {
            res.status(500).json({
                success:false,
                message: "NAME FIELD REQUIRED",
            });
        }

        // SAVE
        const data = await Category.findByIdAndUpdate(id, { name,image }, { new: true });

        res.status(200).json({
            success: true,
            message: "CATEGORY SUCCESSFULLY UPDATED",
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ERROR OCCUR IN CATEGORY UPDATION",
            error: error.message
        });
    }
};


// DELETE
exports.deleteCategory = async (req, res) => {
    try {
        // FETCH DATA
        const { id } = req.body;

        if (!id) {
            res.status(500).json({
                message: "ALL FIELDS ARE REQUIRED",
            });
        }

        // SAVE
        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "CATEGORY SUCCESSFULLY DELETED",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ERROR OCCUR IN CATEGORY DELETION PROCESS",
            error: error.message
        });
    }
};

// GET CATEGORY BY ID
exports.category = async (req, res) => {
    try {
        // FETCH DATA
        const { id } = req.body;

        if (!id) {
            res.status(500).json({
                message: "ALL FIELDS ARE REQUIRED",
            });
        }

        // FIND
        const category = await Category.findById(id).populate('products');

        res.status(200).json({
            success: true,
            message: "CATEGORY SUCCESSFULLY FETCHED",
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ERROR OCCUR IN CATEGORY FETCHED PROCESS",
            error: error.message
        });
    }
}
// GET CATEGORY BY ID
exports.categories = async (req, res) => {
    try {

        // FIND
        const categories = await Category.find().populate('products');

        res.status(200).json({
            success: true,
            message: "CATEGORY SUCCESSFULLY FETCHED",
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ERROR OCCUR IN CATEGORY FETCHED PROCESS",
            error: error.message
        });
    }
}
