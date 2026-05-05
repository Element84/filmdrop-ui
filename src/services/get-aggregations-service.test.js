import { GetCollectionAggregationsService } from './get-aggregations-service'
import { createHeaderValidationTest } from '../testing/service-headers-factory'

const controller = new AbortController()

createHeaderValidationTest(
  'GetCollectionAggregationsService',
  GetCollectionAggregationsService,
  { aggregations: [] },
  ['test-collection', controller.signal],
  { expectedSignal: controller.signal }
)
