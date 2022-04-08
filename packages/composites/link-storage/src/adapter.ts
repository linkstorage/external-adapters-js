import { Requester, Validator, Logger } from '@chainlink/ea-bootstrap'
import {
  AdapterContext,
  AdapterRequest,
  AdapterResponse,
  Config,
  Execute,
  ExecuteWithConfig,
  ExecuteFactory,
  InputParameters,
} from '@chainlink/types'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { base16 } from 'multiformats/bases/base16'
import { makeConfig } from './config'

export const inputParameters: InputParameters = {
  data: {
    required: true,
    description: 'The data to write',
  },
  destChain: {
    aliases: ['targetChain'],
    description: 'The target chain id',
  },
  contractAddr: {
    aliases: ['targetAddress', 'contractAddress'],
    description: 'The contract address will be interacted',
  },
  func: {
    aliases: ['function'],
    description: 'Function to be called',
    required: false,
  },
  cidVersion: {
    required: false,
    description: 'The CID version to be returned',
    type: 'number',
    default: 1,
  },
}

export const execute: ExecuteWithConfig<Config> = async (
  request: AdapterRequest,
  _: any,
  config: any,
): Promise<AdapterResponse> => {
  const validator = new Validator(request, inputParameters)
  Logger.info('processing:', validator.validated.data)
  Logger.info('config data:', config)

  if (validator.error) throw validator.error

  const jobRunID = validator.validated.jobRunID
  const data = validator.validated.data.data
  const cidVersion = validator.validated.data.cidVersion

  const projectId = config.projectId
  const projectSecret = config.projectSecret
  if (config.ipfsURL.includes('infura') && (!projectId || !projectSecret)) {
    throw Error('You MUST config the infura project id and secret')
  }

  const auth =
    projectId && projectSecret
      ? `Basic ${Buffer.from(projectId + ':' + projectSecret).toString('base64')}`
      : ''

  const client = create({
    url: config.ipfsURL,
    headers: {
      authorization: auth,
    },
  })
  const options = { cidVersion, hashAlg: 'sha3-224' }

  const cid = await putFile(serialize({ jobRunID, ...data, ...options }), client, options)
  Logger.debug('cid:', cid.toString())

  const base16HexCid = `0x${cid.toString(base16).slice(1)}`
  const response = { data: { result: base16HexCid, cid: cid.toString() } }

  return Requester.success(jobRunID, response, config.verbose)
}

export const makeExecute: ExecuteFactory<Config> = (config?: Config): Execute => {
  return async (request: AdapterRequest, context: AdapterContext) =>
    execute(request, context, config || makeConfig())
}

const putFile = async (
  data: string | Uint8Array,
  client: IPFSHTTPClient,
  options: Record<string, unknown>,
) => {
  const { cid } = await client.add(data, options)
  return cid
}

const serialize = (data: string | object): string | Uint8Array => {
  if (typeof data === 'string') return data

  return Buffer.from(JSON.stringify(data))
}
