import { prisma } from '../db/index';
import { AppError } from '../middlewares/errorHandler';
import { comparePassword } from './auth.service';

export async function verifyUserCredentials(
    email: string,
    password: string
): Promise<{ id: string; email: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

    return { id: user.id, email: user.email };
}
