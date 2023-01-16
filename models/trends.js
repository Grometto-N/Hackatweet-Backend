const mongoose = require("mongoose");

const trendsSchema = mongoose.Schema({
  hashtag: String,
  tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' }],
});

const Trend = mongoose.model("trends", trendsSchema);

module.exports = Trend;


