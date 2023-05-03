// convert DateTime Range Picker value RFC3339 used by STAC API datetime parameter
// STAC API uses inclusive start and end datetime ranges
const convertDateTime = (dt, start) =>
  `${dt.getUTCFullYear()}-${(dt.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-` +
  `${dt.getUTCDate().toString().padStart(2, '0')}T${
    start ? '00:00:00' : '23:59:59.999'
  }Z`

const convertStartDateTime = (dt) => convertDateTime(dt, true)
const convertEndDateTime = (dt) => convertDateTime(dt, false)

// date used for STAC API request for mosaic view
export const convertDate = (dateTimeRef) => {
  const fromDate = convertStartDateTime(dateTimeRef[0])
  const toDate = convertEndDateTime(dateTimeRef[1])

  return `${fromDate}/${toDate}`
}

// date used for STAC API request for scene view
export const convertDateForURL = (dateTimeRef) =>
  encodeURIComponent(convertDate(dateTimeRef))
