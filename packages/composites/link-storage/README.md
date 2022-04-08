# Chainlink Linkstorage Composite Adapter

This is the linkstorage adapter that provides the ability to save tamper-proof data to IPFS from smart contracts, and interoperate with other blockchains.

## How to use this in smart contracts

For the detailed info, please refer to the repo of [linkstorage-ea-contract](https://github.com/linkstorage/linkstorage-ea-contract).

## Job Spec

```javascript

type = "directrequest"
schemaVersion = 1
name = "Linkstorage"
contractAddress = "<ORACLE_CONTRACT>"
maxTaskDuration = "0s"
observationSource = """
    decode_log   [type="ethabidecodelog"
                  abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                  data="$(jobRun.logData)"
                  topics="$(jobRun.logTopics)"]

    decode_cbor  [type="cborparse" data="$(decode_log.data)"]
    fetch        [type="bridge" name="ezy-bridge" requestData="{\\"id\\": $(jobSpec.externalJobID), \\"data\\": {\\"data\\": $(decode_cbor)}}"]
    parse        [type="jsonparse" path="data,result" data="$(fetch)"]
    encode_data  [type="ethabiencode" abi="(bytes32 value)" data="{ \\"value\\": $(parse) }"]
    encode_tx    [type="ethabiencode"
                  abi="fulfillOracleRequest(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes32 data)"
                  data="{\\"requestId\\": $(decode_log.requestId), \\"payment\\": $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration), \\"data\\": $(encode_data)}"
                 ]
    submit_tx    [type="ethtx" to="<ORACLE_CONTRACT>" data="$(encode_tx)"]

    decode_log -> decode_cbor -> fetch -> parse -> encode_data -> encode_tx -> submit_tx
"""
```

> NOTE: replace `<ORACLE_CONTRACT>` with your oracle contract address.

## Configuration

The adapter takes the following environment variables:

| Required? |          Name           |        Description        | Options |       Defaults to       |
| :-------: | :---------------------: | :-----------------------: | :-----: | :---------------------: |
|           |       `IPFS_URL`        |       The IPFS URL        |         | `http://localhost:5001` |
|           |   `INFURA_PROJECT_ID`   |   The Infura project id   |         |                         |
|           | `INFURA_PROJECT_SECRET` | The Infura project secret |         |                         |

## Build

On Mac M1 chips machines:

### Build OS/ARCH to linux/amd64 to make the image be runnable in Ubuntu OS

#### Option 1:

Add `--platform=linux/amd64` to `From` images in the Dockerfile.

Then run `docker-compose -f docker-compose.generated.yaml build link-storage-adapter`

#### Option 2:

`docker buildx create --use`

`docker buildx bake -f docker-compose.generated.yaml link-storage-adapter --push --set link-storage-adapter.platform=linux/amd64,linux/arm64`

## Running

See the [Composite Adapter README](../README.md) for more information on how to get started.

Or you can try below command out, DON'T forget to replace `<IPFS_URI>` and `<IPFS_PORT>` to yours.

`docker run -d --name linkstorage_ea -p 6080:8000 -e IPFS_URI=<IPFS_URI> -e IPFS_PORT=<IPFS_PORT> -e EA_PORT=8000 -it 0xroad/link-storage-adapter:latest`

### Input Params

| Required? |             Name              |                 Description                  |       Options       | Defaults to |
| :-------: | :---------------------------: | :------------------------------------------: | :-----------------: | :---------: |
|    ✅     |            `data`             |             The data to be saved             |                     |             |
|           | `destChain`, or `targetChain` | The destination chain to be interactive with | `0x1`, `ETH`, `USD` |             |

### Sample Input

```json
{
  "id": "1",
  "data": {
    "data": {
      "key": "dump value"
    }
  }
}
```

### Sample Output

```json
{
  "jobRunID": "0958814163394e14afca5f5dba90eec5",
  "result": "0x0155171c279b3a5712e75806c397c13d9fb577a1a7a28a28b8e9643c423fa870",
  "statusCode": 200,
  "data": {
    "result": "0x0155171c279b3a5712e75806c397c13d9fb577a1a7a28a28b8e9643c423fa870",
    "cid": "bafkrohbhtm5foexhladmhf6bhwp3k55bu6riukfy5fsdyqr7vbya"
  }
}
```
