const express = require('express');
const router = express.Router(); // "mini-application", file separation
const config = require('config'); // organize a set of default parameters
const gravatar = require('gravatar'); // Globally Recognized Avatar
const bcrypt = require('bcryptjs'); // password-hashing(encrypting) function
const jwt = require('jsonwebtoken'); //
const { check, validationResult } = require('express-validator');

// import user model(schema) - User: one to one mapping of mongoDB data
const User = require('../../models/User');

// @route POST api/users
// @desc Register user
// @access Public
router.post(
	'/',
	// request form constraints(express-validator)
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 })
	],
	async (req, res) => {
		// validate request(express-validator)
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if user exists in DB, using email
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
			}
			// Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});
			// 3. Creating new instance(data) of document
			user = new User({
				name,
				email,
				avatar,
				password
			});
			// Encrypt password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
			// 4. Save data to mongoDB
			await user.save();
			// Return jsonwebtoken
			const payload = {
				user: {
					id: user.id
				}
			};
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 3600000 },
				(err, token) => {
					if (err) throw err;
					// send back(response) to client
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
