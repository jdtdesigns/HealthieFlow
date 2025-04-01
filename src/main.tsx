import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './styles/form.css'
import './styles/modal.css'

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './store/index.tsx'

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

export const client = new ApolloClient({
  link: from([errorLink, new HttpLink({ uri: 'https://rickandmortyapi.com/graphql' })]),
  cache: new InMemoryCache()
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <StoreProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StoreProvider>
    </ApolloProvider>
  </StrictMode>,
)
