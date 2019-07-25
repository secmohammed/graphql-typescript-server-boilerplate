import * as yup from "yup";
import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../../types/graphql-utils";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { User } from "../../../entity/User";
import { userNotFoundError, expiredKeyError } from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";
import { formatYupError } from "../../../utils/formatYupError";

// 20 minutes
// lock account

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: "email",
            message: userNotFoundError
          }
        ];
      }
      await Promise.all([
        forgotPasswordLockAccount(user.id),
        createForgotPasswordLink(process.env.FRONT_END_URL as string, user.id)
      ]);
      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const userId = await redis.get(key);
      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError
          }
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update(
        { id: userId },
        {
          forgotPasswordLocked: false,
          password: hashedPassword
        }
      );

      const deleteKeyPromise = redis.del(key);

      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    }
  }
};
