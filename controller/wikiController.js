const Article = require("../models/wikiModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllArticles = catchAsync(async (req, res, next) => {
    const articles = await Article.find();
    res.status(200).json({
        status: "success",
        results: articles.length,
        data: {
            articles,
        }
    });
});


exports.getOneArticle = catchAsync(async (req, res, next) => {
   
    const article = await Article.findOne({ title: req.params.title })
    if (!article) {
        return next(new Error("No article found with that title"))
    }
    res.status(200).json({
        status: "success",
        data: {
            article,
        },
    })
});

// exports.createArticle = async (req, res) => {
//     try {
//         const { title, content, author } = req.body
//         if (!title || !content || !author) {
//             return res
//                 .status(400)
//                 .json({status: "fail", message: "Missing required fields"})
//         }
//         const newArticle = await Article.create({ title, content, author });
//         res.status(200).json({
//             status: "success",
//             data: {
//                 article: newArticle,
//             },
//         })
//    } catch (err) {
//        console.log("Error creating article", err);
//        res.status(500).json({status: "error", message: "Internal server error"})
    
//    }
// }
 
// ..... Before adding the catchAsync function

exports.createArticle = catchAsync(async (req, res) => {
    
        const { title, content, author } = req.body
        // if (!title || !content || !author) {
        //     return new AppError("Missing required fields", 400)
        //     // return res
        //     //     .status(400)
        //     //     .json({status: "fail", message: "Missing required fields"})
        // }
        const newArticle = await Article.create({ title, content, author });
        res.status(200).json({
            status: "success",
            data: {
                article: newArticle,
            },
        })
})
exports.updateArticle = catchAsync(async (req, res, next) => {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!article) {
        return next(new Error("No article found with that ID"))
    }
    res.status(200).json({
        status: "success",
        data: {
            article,
        },
    })
});
exports.deleteArticle = catchAsync(async (req, res) => {

    const article = await Article.findByIdAndDelete(req.params.id)
    if (!article) {
        return next(new Error("No article found with that ID"))
    }
    res.status(204).json({
        status: "success",
        data: null,
    })
});