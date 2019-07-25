import { Resolver } from "../../../types/graphql-utils";
import * as jwt from "jsonwebtoken";

export default async (
    resolver: Resolver,
    parent: any,
    args: any,
    context: any,
    info: any
) => {
    let user;
    try {
        user = jwt.verify(context.request.get("Authorization"), process.env
            .JWT_SECRET as string);
        context.user = user;
    } catch (e) {
        context.user = null;
    }

    return resolver(parent, args, context, info);
};
