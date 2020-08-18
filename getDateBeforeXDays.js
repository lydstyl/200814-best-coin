const date = require('date-and-time')

const getDateBeforeXDays = (days) => {
  const now = new Date()

  const obj = {}
  obj.now = date.format(now, 'DD-MM-YYYY')

  let tmp = date.addDays(now, -days)
  tmp = date.format(tmp, 'DD-MM-YYYY')
  obj.before = tmp

  return obj
}

// console.log(getDateBeforeXDays(7))

module.exports = getDateBeforeXDays
