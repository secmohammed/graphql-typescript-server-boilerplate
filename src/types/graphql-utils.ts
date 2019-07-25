import { Redis } from "ioredis";
import { PubSub } from "graphql-yoga";
interface User {
  _id: string;
  iat: number;
}

export interface Context {
  redis: Redis;
  url: string;
  pubsub: PubSub;
  user: User;
  request: Express.Request;
  response: Express.Response;
}

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any
) => any;

export type GraphQLMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any
) => any;

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
