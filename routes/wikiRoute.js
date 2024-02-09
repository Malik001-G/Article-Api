const express = require("express");
const wikiController = require("../controller/wikiController");

const router = express.Router();

router.route("/article")
    .get(wikiController.getAllArticles)
    .post(wikiController.createArticle);


router.route("/article/:id")
    .patch(wikiController.updateArticle)
    .delete(wikiController.deleteArticle)


router.route("/article/:title")
    .get(wikiController.getOneArticle)
    
module.exports = router