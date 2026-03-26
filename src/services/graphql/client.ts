import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { SecureStoreService } from '../secureStore';

const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || 'https://controlapp.io/graphql';

const httpLink = createHttpLink({
    uri: GRAPHQL_URL,
});

const authLink = setContext(async (_, { headers }) => {
    try {
        const token = await SecureStoreService.getToken();
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : '',
            },
        };
    } catch (error) {
        console.warn('Error getting token for GraphQL:', error);
        return { headers };
    }
});

export const apolloClient = new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    inventoryItems: {
                        keyArgs: ['proyecto_id', 'name', 'type', 'is_active'],
                        merge(existing, incoming) {
                            if (!existing) return incoming;
                            return {
                                ...incoming,
                                data: [...(existing.data || []), ...incoming.data],
                            };
                        },
                    },
                    productionProcesses: {
                        keyArgs: ['proyecto_id'],
                        merge(existing, incoming) {
                            if (!existing) return incoming;
                            return {
                                ...incoming,
                                data: [...(existing.data || []), ...incoming.data],
                            };
                        },
                    },
                    loteProducciones: {
                        keyArgs: ['proyecto_id', 'status'],
                        merge(existing, incoming) {
                            if (!existing) return incoming;
                            return {
                                ...incoming,
                                data: [...(existing.data || []), ...incoming.data],
                            };
                        },
                    },
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'cache-first',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});

export const resetApolloStore = () => {
    apolloClient.clearStore();
};

export default apolloClient;
