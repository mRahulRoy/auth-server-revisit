import { checkSchema } from 'express-validator';

export default checkSchema({
    name: {
        notEmpty: true,
        errorMessage: 'Tenant name is required!',
        trim: true,
    },
    address: {
        notEmpty: true,
        errorMessage: 'Tenant address is required!',
        trim: true,
    },
});
