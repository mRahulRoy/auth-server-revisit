import { checkSchema } from 'express-validator';

// export default [body('email').notEmpty().withMessage('Email is required!')];
export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        toLowerCase: true,
        trim: true,
        isEmail: { errorMessage: 'Email is invalid' },
    },
    firstName: {
        notEmpty: true,
        errorMessage: 'First name is required',
        trim: true,
    },
    lastName: {
        notEmpty: true,
        errorMessage: 'Last name is required',
        trim: true,
    },
    password: {
        notEmpty: true,
        errorMessage: 'Password is required',
        trim: true,
    },
});
