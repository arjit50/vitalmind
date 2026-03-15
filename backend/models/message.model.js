import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String
  },
  medicineInfo: {
    name: String,
    purpose: String,
    usage: String,
    timing: String,
    sideEffects: String,
    safetyWarnings: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;