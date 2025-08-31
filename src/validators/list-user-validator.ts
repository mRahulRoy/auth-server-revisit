import { checkSchema } from 'express-validator';

export const customStringFeildSantizer = (value: unknown) => {
    return value ?? '';
};

export const customIntFeildSantizer = (value: unknown) => {
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? 1 : ~~parsedValue;
};

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: customStringFeildSantizer,
            },
        },
        role: {
            customSanitizer: {
                options: customStringFeildSantizer,
            },
        },
        currentPage: {
            customSanitizer: {
                options: customIntFeildSantizer,
            },
        },
        perPage: {
            customSanitizer: {
                options: customIntFeildSantizer,
            },
        },
    },
    ['query'],
);
