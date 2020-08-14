//1. Import coingecko-api
const CoinGecko = require('coingecko-api')

const options = {
  exchange: 'binance',
  date1: '10-07-2020',
  date2: '10-08-2020',
  isEvoBtc: true, // or 'evoUsd' if false
  isWinner: true, // looser if false
}

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko()

function wait(ms) {
  var start = new Date().getTime()
  var end = start
  while (end < start + ms) {
    end = new Date().getTime()
  }
}

const compareMarketCapFrom2Dates = async (coin, date1, date2) => {
  const coinEvo = { name: coin }

  let data = await CoinGeckoClient.coins.fetchHistory(coin, {
    date: date1,
  })

  try {
    coinEvo[date1] = {
      btc: data.data.market_data ? data.data.market_data.market_cap.btc : null,
      usd: data.data.market_data ? data.data.market_data.market_cap.usd : null,
    }

    data = await CoinGeckoClient.coins.fetchHistory(coin, {
      date: date2,
    })

    coinEvo[date2] = {
      btc: data.data.market_data ? data.data.market_data.market_cap.btc : null,
      usd: data.data.market_data ? data.data.market_data.market_cap.usd : null,
    }

    coinEvo.marketEvoInBtc = coinEvo[date1].btc
      ? coinEvo[date2].btc / coinEvo[date1].btc
      : 0

    coinEvo.marketEvoInUsd = coinEvo[date1].usd
      ? coinEvo[date2].usd / coinEvo[date1].usd
      : 0

    return coinEvo
  } catch (error) {
    console.log('compareMarketCapFrom2Dates -> error', coin, error)
    coinEvo.marketEvoInBtc = 0

    coinEvo.marketEvoInUsd = 0
    return coinEvo
  }
}

const main = async () => {
  let data = await CoinGeckoClient.exchanges.fetchTickers(options.exchange)

  let binanceCoin = data.data.tickers.map((t) => ({
    base: t.base,
    coin_id: t.coin_id,
  }))
  //.slice(0, 48) // 100 request / minute limit

  // remove duplicate binance coins
  const unique = binanceCoin
    .map((e) => e.base)
    .map((e, i, final) => final.indexOf(e) === i && i)

  binanceCoin = binanceCoin.filter((bc, i) => {
    if (unique[i] !== false) {
      return bc
    }
  })

  // add evolution to each coin
  binanceCoin = binanceCoin.map(async (bc) => {
    const newBinanceCoin = { ...bc }

    newBinanceCoin.evo = await compareMarketCapFrom2Dates(
      bc.coin_id,
      options.date1,
      options.date2
    )

    return newBinanceCoin
  })

  // console.log('promises:', binanceCoin[0])

  Promise.all(binanceCoin).then((coins) => {
    coins = coins.map((c) => ({
      base: c.base,
      evo: options.isEvoBtc ? c.evo.marketEvoInBtc : c.evo.marketEvoInUsd,
    }))

    const evo = options.isEvoBtc ? 'evoBtc' : 'evoUsd'

    coins = coins.sort((a, b) => {
      if (a.evo > b.evo) {
        return options.isWinner ? -1 : 1
      } else if (a.evo < b.evo) {
        return options.isWinner ? 1 : -1
      } else {
        return 0
      }
    })

    // console.log('coins', coins.slice(0, 20))
    console.log('coins', coins)
  })
}

//3. Make calls
main()
