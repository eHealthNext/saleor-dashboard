import { gql } from "@apollo/client";
import {
  SearchOrderVariantDocument,
  SearchOrderVariantQuery,
  SearchOrderVariantQueryVariables
} from "@saleor/graphql";
import makeTopLevelSearch from "@saleor/hooks/makeTopLevelSearch";

export const searchOrderVariant = gql`
  query SearchOrderVariant(
    $channel: String!
    $first: Int!
    $query: String!
    $after: String
    $address: AddressInput
  ) {
    search: products(
      first: $first
      after: $after
      filter: { search: $query }
      channel: $channel
    ) {
      edges {
        node {
          id
          name
          thumbnail {
            url
          }
          variants {
            id
            name
            sku
            pricing(address: $address) {
              priceUndiscounted {
                gross {
                  ...Money
                }
              }
              price {
                gross {
                  ...Money
                }
              }
              onSale
            }
            channelListings {
              channel {
                id
                isActive
                name
                currencyCode
              }
              price {
                amount
                currency
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

export const useOrderVariantSearch = makeTopLevelSearch<
  SearchOrderVariantQuery,
  SearchOrderVariantQueryVariables
>(SearchOrderVariantDocument);
