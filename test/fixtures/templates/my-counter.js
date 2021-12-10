module.exports = function MyCounter(state={}) {
  const { count=0 } = state
  return `
<h3>Count: ${count}</h3>
`
}
