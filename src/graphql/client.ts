import { GraphQLClient } from 'graphql-request';
import * as SecureStore from 'expo-secure-store';

const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || 
    process.env.EXPO_PUBLIC_API_URL?.replace('/api', '/graphql') || 
    'https://controlapp.io/graphql';

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';
export const CREDENTIALS_KEY = 'auth_credentials';

let logoutCallback: (() => void) | null = null;

export const setGraphQLLogoutCallback = (logout: () => void) => {
    logoutCallback = logout;
};

const createClient = (token?: string | null) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return new GraphQLClient(GRAPHQL_URL, {
        headers,
    });
};

let cachedClient: GraphQLClient | null = null;

export const getGraphQLClient = async (): Promise<GraphQLClient> => {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        cachedClient = createClient(token);
        return cachedClient;
    } catch {
        cachedClient = createClient(null);
        return cachedClient;
    }
};

export const refreshClient = async (token: string): Promise<GraphQLClient> => {
    cachedClient = createClient(token);
    return cachedClient;
};

export const invalidateClient = async (): Promise<void> => {
    cachedClient = null;
};

export { GRAPHQL_URL };
