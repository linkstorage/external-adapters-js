import { Requester, util } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'
import 'dotenv/config'
import { CustomConfig } from '../index.d'

export const NAME = 'LINKSTORAGE'
export const DEFAULT_IPFS_URL = 'http://localhost:5001'

export const makeConfig = (prefix?: string): Config => {
  const config: CustomConfig = Requester.getDefaultConfig(prefix)
  config.ipfsURL = util.getEnv('IPFS_URL') || DEFAULT_IPFS_URL
  config.projectId = util.getEnv('INFURA_PROJECT_ID') || ''
  config.projectSecret = util.getEnv('INFURA_PROJECT_SECRET') || ''
  config.verbose = util.parseBool(util.getEnv('VERBOSE')) || true
  return config
}
