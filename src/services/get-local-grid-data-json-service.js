import { store } from '../redux/store'
import { setLocalGridData } from '../redux/slices/mainSlice'

export async function LoadLocalGridDataService(fileName) {
  const cacheBuster = Date.now()
  await fetch(`/data/${fileName}.json?_cb=${cacheBuster}`, {
    method: 'GET',
    cache: 'no-store'
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
