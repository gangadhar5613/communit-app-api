const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);



const questionSchema = new Schema({
    title:{type:String,required:true},
    author:{type:String,required:true,ref:'User'},
    slug:{type:String,slug:'title'},
    description:{type:String},
    tags:[{type:String}],
    answers:[{type:Schema.Types.ObjectId,ref:"Answer"}]
},{timestamps:true})



const Question = mongoose.model("Question",questionSchema);

module.exports = Question;