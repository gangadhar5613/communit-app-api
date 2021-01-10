var express = require('express');
var router = express.Router();
const Question = require('../models/Question');
const jwt = require('../modules/token');
const User = require('../models/User')
const Answer = require('../models/Answer');
const slug = require('mongoose-slug-generator');
const mongoose = require('mongoose');



/* GET users listing. */

router.post('/',jwt.verifyJwt,async(req,res,next) => {
    const currentUser = req.user;

    try {
        const user = await User.findOne({username:currentUser.username});
        req.body.question.author = user.id;
        
        console.log('hello' + user);
        const question = await Question.create(req.body.question);
        res.json({question:questionView(question,user)})
    } catch (error) {
        next(error);
    }
})


/* GET list all questions */


router.get('/',async(req,res,next) => {
   const questionsView = []
   const answers = [];
   try {

       const questions = await Question.find({}).populate('author').populate({path:'answers',populate:{path:'answers'}})
       
       questions.forEach((question) => {

           question.answers.forEach( (answer) => {
               console.log(answer)
                answers.push(answerView(answer,answer.author,answer.questionId));
               
           })
           questionsView.push(questionView(question,question.author,answers));

       })

       res.json({questions:questionsView});

   } catch (error) {
       next(error)
   }


})



/* PUT  update question */

router.put('/:questionId',jwt.verifyJwt,async(req,res,next) => {
    const currentUser = req.user;
    const questionId = req.params.questionId;

     try {
         const question = await Question.findOne({_id:questionId}).populate('author');
         if(currentUser.username == question.author.username){
             const updateQuestion = await Question.findOneAndUpdate({_id:questionId},req.body.question,{new:true});
             res.json({question:questionView(updateQuestion,question.author)});
         }else{
             res.status(401).json({message:"You are not authorized "})
         }
     } catch (error) {
         next(error);
     }
  

})





/* DELETE  delete question */

router.delete('/:slug',jwt.verifyJwt,async(req,res,next) => {
    const currentUser = req.user;
    const slug = req.params.slug;

    try {
        const question = await Question.findOne({slug:slug}).populate('author');
         if(currentUser.username == question.author.username){
             const deletedQuestion = await Question.findOneAndDelete({slug:slug});
             res.json({question:questionView(deletedQuestion,question.author)})
         }else{
             res.status(401).json({message:'You are not authorized'});
         }
    } catch (error) {
        next(error);
    }
})


/* POST add the answer to the question */

router.post('/:questionId/answers',jwt.verifyJwt,async(req,res,next) => {
    const questionId = req.params.questionId;
    const currentUser = req.user;
     
    try {
        const user = await User.findOne({email:currentUser.email});
        req.body.answer.author = user.id;
        req.body.answer.questionId = questionId;
        const answer = await Answer.create(req.body.answer);
        const question = await Question.findByIdAndUpdate({_id:questionId},{$push : {answers: answer.id}},{new:true});
      res.json({answer:answerView(answer,user,questionId)});
      
    } catch (error) {
        next(error);
    }
})



/* GET list all answers of particular question */

router.get('/:questionId/answers',jwt.verifyJwt,async(req,res,next) => {
    const questionId = req.params.questionId;
    const answersView = [];
    try {
        const answers = await Answer.aggregate([{$match : {questionId : new mongoose.Types.ObjectId(`${questionId}`)}}]);
        answers.forEach( async (answer) => {
               answersView.push(answerView(answer,answer.author,questionId))
        })
        res.json({answers:answersView});
    } catch (error) {
        next(error)
    }
})



/* PUT update answer of particular question */

router.put('/answers/:answerId',jwt.verifyJwt,async(req,res,next) => {
    const answerId = req.params.answerId;
    const currentUser = req.user;
    try {
        const author = await User.findOne({email:currentUser.email});
        const oldAnswer = await Answer.findOne({_id:answerId})
        
        if(oldAnswer.author == author.id ){
            const updatedAnswer = await Answer.findByIdAndUpdate({_id:answerId},req.body.answer,{new:true});
            res.json({answer:answerView(updatedAnswer,author,updatedAnswer.questionId)}) 
        }else{
            res.status(401).json({ message:"You are not authorized"})
        }
    } catch (error) {
        next(error);
    }
})



/* DELETE delete answer of particular question */

router.delete('/answers/:answerId',jwt.verifyJwt,async(req,res,next) => {
    const answerId = req.params.answerId;
    const currentUser = req.user;
    try {
        const author = await User.findOne({email:currentUser.email});
        const answer = await Answer.findOne({_id:answerId})

        if(answer.author == author.id){
            
            const updatedQuestions = await Question.findOneAndUpdate({_id:answer.questionId},{$pull: {$answers: new mongoose.Types.ObjectId(`${answer.questionId}`) }});
            console.log(updatedQuestions.answer)
            const deletedAnswer =  await Answer.findByIdAndDelete({_id:answerId});
            res.json({answer:answerView(deletedAnswer,author,deletedAnswer.questionId)});
        }else{
            res.status(401).json({message:'You are not authorized'});
        }
    } catch (error) {
        next(error);
    }
})





function questionView(question,author,answers){
    return{
        tags:question.tags,
        answers:answers,
        id:question.id,
        title:question.title,
        description:question.description,
        author:{
            id:author.id,
            username:author.username
        },
        createdAt:question.createdAt,
        updatedAt:question.updatedAt,
        slug:question.slug

    }
}



function answerView(answer,author,questionId){
    return {
        id:answer.id,
        answer:answer.answer,
        author:{
            id:author.id,
            username:author.username
        },
        questionId:questionId,
        createdAt:answer.createdAt,
        updatedAt:answer.updatedAt
    }
}


module.exports = router;