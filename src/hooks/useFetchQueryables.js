import { useFetch } from './index'

export default function useFetchQueryables(collection) {
  const API_URL = `${process.env.REACT_APP_STAC_API_URL}/collections/${collection}/queryables`

  const { state, data = {} } = useFetch({
    url: API_URL
  })

  return {
    state,
    data
  }
}