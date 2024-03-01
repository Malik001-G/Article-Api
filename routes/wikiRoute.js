const express = require("express");
const wikiController = require("../controller/wikiController");
const authController = require("../controller/authController");



const router = express.Router();

router.route("/article")
    .get(authController.protect, wikiController.getAllArticles)
    .post(authController.protect, authController.restrictTo("author"), wikiController.createArticle);


router.route("/article/:id")
    .patch(wikiController.updateArticle)
    .delete(wikiController.deleteArticle)


router.route("/article/:title")
    .get(wikiController.getOneArticle)
    
module.exports = router