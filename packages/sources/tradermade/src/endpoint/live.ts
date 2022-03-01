import { HTTP, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, Config, InputParameters } from '@chainlink/types'
import { NAME } from '../config'
import overrides from '../config/symbols.json'

export const supportedEndpoints = ['live', 'commodities', 'stock']

export const inputParameters: InputParameters = {
  base: {
    aliases: ['from', 'symbol', 'market'],
    required: true,
    description: 'The symbol of the currency to query',
    type: 'string',
  },
  quote: {
    aliases: ['to', 'convert'],
    required: false,
    description: 'The quote currency',
    type: 'string',
  },
}

export interface ResponseSchema {
  endpoint: string
  quotes: {
    ask: number
    base_currency: string
    bid: number
    mid: number
    quote_currency: string
  }[]
  requested_time: string
  timestamp: number
}

export const execute: ExecuteWithConfig<Config> = async (input, _, config) => {
  const validator = new Validator(input, inputParameters, {}, { overrides })

  HTTP.logConfig(config)

  const jobRunID = validator.validated.id
  const symbol = (validator.overrideSymbol(NAME) as string).toUpperCase()

  /**
   * Note that currency can also mean equity.  This is why "to" is not a required variable
   */
  const to = (validator.validated.data.quote || '').toUpperCase()
  const currency = `${symbol}${to}`

  const params = {
    ...config.api.params,
    currency,
  }

  const options = { ...config.api, params }

  const response = await HTTP.request<ResponseSchema>(options)
  const result = HTTP.validateResultNumber(response.data, ['quotes', 0, 'mid'])
  return HTTP.success(jobRunID, HTTP.withResult(response, result), config.verbose)
}
