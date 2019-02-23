const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jamSchema = new Schema({
  name: { type: String },
  location: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' } ]
})

const Jam = mongoose.model('Jam', jamSchema);
module.exports = Jam;