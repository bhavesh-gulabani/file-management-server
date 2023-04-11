import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const fileModel = mongoose.model('File', FileSchema);

export default fileModel;
