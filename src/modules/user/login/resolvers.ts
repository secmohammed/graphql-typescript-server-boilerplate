import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import {
  invalidLogin,
  confirmEmailError,
  forgotPasswordLockedError
} from "./errorMessages";

const errorResponse = [
  {
    path: "email",
    message: invalidLogin
  }
];

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmailError
          }
        ];
      }

      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: forgotPasswordLockedError
          }
        ];
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return errorResponse;
      }

      // login sucessful
      let token = jwt.sign(
        {
          _id: user.id
        },
        process.env.JWT_SECRET as string
      );

      return [
        {
          path: "token",
          message: token
        }
      ];
    }
  }
};
