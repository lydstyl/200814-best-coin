import main from './script'

async function App() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="container">
      coucou
    </div>
  `

  const pcoins = main()

  pcoins.then((coins) => {
    console.log('App -> coins', coins)

    coins = coins
      .map((c) => ({
        base: c.base,
        evo: c.evo.marketEvoInBtc,
      }))
      .filter((c) => {
        if (c.evo) {
          return c
        }
      })

    const evo = 'evoBtc'

    coins = coins.sort((a, b) => {
      if (a.evo > b.evo) {
        return true ? -1 : 1
      } else if (a.evo < b.evo) {
        return true ? 1 : -1
      } else {
        return 0
      }
    })

    coins = coins.map((c) => {
      return `<div>${c.base} ${c.evo}</div>`
    })

    coins = coins.join(' ')

    app.innerHTML = `
    <pre class="container">
      ${coins}
    </pre>
  `
  })
}

export default App
