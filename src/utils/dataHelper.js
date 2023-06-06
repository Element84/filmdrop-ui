import { GetCollectionQueryablesService } from '../services/get-queryables-service'
import { GetCollectionAggregationsService } from '../services/get-aggregations-service'
import { LoadLocalGridDataService } from '../services/get-local-grid-data-json-service'

export async function buildCollectionsData(collections) {
  for (const collection of collections.collections) {
    const [queryables, aggregations] = await Promise.all([
      GetCollectionQueryablesService(collection.id),
      GetCollectionAggregationsService(collection.id)
    ])
    collection.queryables = queryables
    collection.aggregations = aggregations
  }

  collections.collections = collections.collections.sort((a, b) =>
    a.id > b.id ? 1 : b.id > a.id ? -1 : 0
  )

  return collections.collections
}

export async function loadLocalGridData() {
  const dataFiles = ['cdem', 'doqq', 'mgrs', 'wrs2']
  dataFiles.map(async function (d) {
    await LoadLocalGridDataService(d)
  })
}
