const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.users_signup = (req, res, next) => {
    User.find({ email: req.body.email }).exec().then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: 'Mail exists'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: err });
                } else {
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user.save().then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created',
                            user: {
                                _id: result._id,
                                email: result.email
                            }
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    });
                }
            });
        }
    });
};

exports.users_login = (req, res, next) => {
    User.find({ email: req.body.email }).exec().then(users => {
        if (users.length < 1) {
            return res.status(404).json({
                message: 'Auth failed'
            });
        }
        bcrypt.compare(req.body.password, users[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            if (result) {
                const token = jwt.sign({
                    email: users[0].email,
                    userId: users[0]._id
                }, process.env.JWT_KEY, {
                        expiresIn: '1h'
                    });
                return res.status(200).json({
                    message: 'Auth Successful',
                    token: token
                });
            }
            return res.status(401).json({
                message: 'Auth failed'
            });
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
};

exports.users_delete_user = (req, res, next) => {
    User.remove({ _id: req.params.userId }).then(result => {
        res.status(200).json({ message: 'User deleted' });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
};