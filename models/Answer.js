const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    answer:{type:String,required:true},
    author:{type:Schema.Types.ObjectId,required:true,ref:"User"},
    questionId:{type:Schema.Types.ObjectId,ref:"Question"},
},{timestamps:true});


const Answer = mongoose.model("Answer",answerSchema);

module.exports = Answer;