import { GetCollectionAggregationsService } from './get-aggregations-service'
import { createHeaderValidationTest } from '../testing/service-headers-factory'

createHeaderValidationTest(
  'GetCollectionAggregationsService',
  GetCollectionAggregationsService,
  { aggregations: [] },
  ['test-collection']
)
