const Article = require("../models/wikiModel");


exports.getAllArticles = async (req, res, next) => {
    try {
        const articles = await Article.find();
        res.status(200).json({
            status: "success",
            results: articles.length,
            data: {
                articles,
            }
        })
    } catch (err) {
        next(err)
    }
}
exports.getOneArticle = async(req, res, next) => {
    try {
        const article = await Article.findOne({title: req.params.title})
        if (!article) {
            return next(new Error ("No article found with that title"))
        }
        res.status(200).json({
            status: "success",
            data: {
                article,
            },
        })
    } catch (err) {
     next(err)
    }
}
exports.createArticle = async (req, res) => {
    try {
        const { title, content, author } = req.body
        if (!title || !content || !author) {
            return res
                .status(400)
                .json({status: "fail", message: "Missing required fields"})
        }
        const newArticle = await Article.create({ title, content, author });
        res.status(200).json({
            status: "success",
            data: {
                article: newArticle,
            },
        })
   } catch (err) {
       console.log("Error creating article", err);
       res.status(500).json({status: "error", message: "Internal server error"})
    
   }
}
exports.updateArticle = async (req, res, next) => {
   try {
       const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
           new: true,
           runValidators: true,
       });
       if (!article) {
           return next(new Error ("No article found with that ID"))
       }
       res.status(200).json({
           status: "success",
           data: {
               article,
           },
       })
   } catch (err) {
    next(err)
   }
}
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id)
        if (!article) {
            return next(new Error ("No article found with that ID"))
        }
        res.status(204).json({
            status: "success",
            data: null,
        })
    } catch (err) {
     next(err)
    }
}
