const Joi = require('joi');

const registerValidation = Joi.object({
    name: Joi.string().max(100).required().messages({
        'string.base': 'Name must be a string',
        'string.max': 'Name can be at most 100 characters',
        'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be valid',
        'any.required': 'Email is required'
    }),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}|\\[\\]:";\'<>?,./]).+$'))
        .required()
        .messages({
            'string.pattern.base': 'Password must be at least 8 characters and include one uppercase letter, one number, and one special character',
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        })

});

module.exports = registerValidation;
