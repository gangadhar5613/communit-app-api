var express = require('express');
var router = express.Router();
const Question = require('../models/Question');

/* GET all tags */


router.get('/',async(req,res,next) => {
      try {
        const tags = await Question.distinct('tags');
        res.json({tags:tags})
      } catch (error) {
        next(error);
      }
})

module.exports = router;
