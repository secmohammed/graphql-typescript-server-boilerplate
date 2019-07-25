import { User } from "../entity/User";

export const forgotPasswordLockAccount = async (userId: string) => {
    // can't login
    await User.update({ id: userId }, { forgotPasswordLocked: true });
    // remove all sessions
};
