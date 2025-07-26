import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create HTTP Link to 12thhaus GraphQL Server
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'same-origin',
});

// Apollo Client Configuration for 12thhaus Spiritual Platform
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          spiritual_disciplines: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          practitioners: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          services: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;