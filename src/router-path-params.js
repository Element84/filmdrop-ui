export function extractPathParamsFromMatches(matches) {
  let params = {}
  for (const match of matches || []) {
    if (match?.params) {
      params = { ...params, ...match.params }
    }
  }
  return params
}
