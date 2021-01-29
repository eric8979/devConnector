const mongoose = require('mongoose');

// 1. Create schema for new mongoDB collection
const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	avatar: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now
	}
});

// 2. Wrap User schema to mongoose model
// use 'User'(in parenthesis) for the name of mongoDB collection name "users"
module.exports = User = mongoose.model('User', UserSchema);

/*
mongoDB

document:
{
	name: 'blabla',
	something: 32,
	...
}

collection: group of documents
*/
