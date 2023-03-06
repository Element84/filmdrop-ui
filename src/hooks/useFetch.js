import { useCallback, useState, useEffect } from 'react'

const defaultState = {
  loading: true,
  error: false
}

const defaultMethod = 'get'

export default function useFetch({ url, method = defaultMethod }) {
  const [response, updateResponse] = useState()
  const [requestState, updateRequestState] = useState(defaultState)

  async function request() {
    updateRequestState((prev) => {
      return {
        ...prev,
        loading: true
      }
    })

    const response = await fetch(url)

    const data = await response.json()

    updateRequestState((prev) => {
      return {
        ...prev,
        loading: false
      }
    })

    return data
  }

  const memoizedRequest = useCallback(async () => {
    const response = await request({
      url,
      method
    })
    updateResponse(response)
  }, [url, method])

  useEffect(() => {
    memoizedRequest()
  }, [memoizedRequest])

  return {
    response,
    state: requestState,
    data: response,
    request: memoizedRequest
  }
}
