import { Config } from '@chainlink/types'

export type CustomConfig = Config & {
  ipfsURL?: string
  projectId?: string
  projectSecret?: string
}
