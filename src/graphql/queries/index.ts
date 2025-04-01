import { gql } from '@apollo/client'

export const GET_CHARACTERS = gql`
  query GetCharacters {
    characters {
    results {
      	name
      	species
      	gender
        image
    }
  }
  }
`