export const resolvers = {
    Counter: {
        countStr: (counter: any) => `Current count: ${counter.count}`
    },
    Subscription: {
        counter: {
            subscribe: (_: any, __: any, { pubsub }: any) => {
                const channel = Math.random()
                    .toString(36)
                    .substring(2, 15); // random channel name
                let count = 0;
                setInterval(
                    () =>
                        pubsub.publish(channel, {
                            counter: { count: count++ }
                        }),
                    2000
                );
                return pubsub.asyncIterator(channel);
            }
        }
    }
};
