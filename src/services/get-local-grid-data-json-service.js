import { store } from '../redux/store'
import { setLocalGridData } from '../redux/slices/mainSlice'
// import { addDataToLayer } from '../utils/mapHelper'

export async function LoadLocalGridDataService(fileName) {
  await fetch(`/data/${fileName}.json`, {
    method: 'GET'
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      const getLocalGridData = store.getState().mainSlice.localGridData
      const newObject = {}
      newObject[fileName] = json
      if (!getLocalGridData.includes(newObject)) {
        store.dispatch(setLocalGridData([...getLocalGridData, newObject]))
      }
    })
    .catch((error) => {
      const message = 'Error Fetching Local Grid Data'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
