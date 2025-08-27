import Bcrypt from 'bcrypt';

export class CredentialService {
    constructor() {}
    async comparePassword(userPassword: string, hashedPassword: string) {
        return await Bcrypt.compare(userPassword, hashedPassword);
    }
}
