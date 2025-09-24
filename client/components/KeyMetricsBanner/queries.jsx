import { gql } from '@apollo/client';

export const KEY_METRICS_QUERY = gql`
  query KeyMetricsQuery {
    keyMetrics {
      date
      verdictsCount
      commandsCount
      contributorsCount
      verdictsLast90Count
    }
  }
`;
