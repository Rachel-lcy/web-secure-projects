import mongoose from "mongoose";

const fileSchema = mongoose.Schema({
  filename: {type: String, required: true},
  path: {type: String, required: true},
  uploadBy: String,
  department: {
    type: String,
    enum: ['hr', 'dev','test','admin','finance'], required: true
  },
  createAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('File', fileSchema)