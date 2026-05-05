import { FetchPageService } from './get-pagination-service'
import { createHeaderValidationTest } from '../testing/service-headers-factory'

createHeaderValidationTest(
  'FetchPageService',
  FetchPageService,
  { features: [], links: [] },
  ['https://stac-api.example.com/search?page=2', 2]
)
