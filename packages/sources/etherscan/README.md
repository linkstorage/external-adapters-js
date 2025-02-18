# Chainlink External Adapter for EtherScan

Version: 1.2.28

This document was generated automatically. Please see [README Generator](../../scripts#readme-generator) for more info.

## Environment Variables

| Required? |  Name   |                            Description                            |  Type  | Options |          Default           |
| :-------: | :-----: | :---------------------------------------------------------------: | :----: | :-----: | :------------------------: |
|    ✅     | API_KEY | An API key that can be obtained [here](https://etherscan.io/apis) | string |         | `https://api.etherscan.io` |

---

## Input Parameters

| Required? |   Name   |     Description     |  Type  |            Options             |  Default   |
| :-------: | :------: | :-----------------: | :----: | :----------------------------: | :--------: |
|           | endpoint | The endpoint to use | string | [gasprice](#gasprice-endpoint) | `gasprice` |

---

## Gasprice Endpoint

`gasprice` is the only supported name for this endpoint.

### Input Params

| Required? | Name  | Aliases |    Description    |  Type  |         Options          | Default | Depends On | Not Valid With |
| :-------: | :---: | :-----: | :---------------: | :----: | :----------------------: | :-----: | :--------: | :------------: |
|           | speed |         | The desired speed | string | `fast`, `medium`, `safe` | `fast`  |            |                |

### Example

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "gasprice",
    "speed": "fast"
  }
}
```

Response:

```json
{
  "jobRunID": "1",
  "data": {
    "status": "1",
    "message": "OK",
    "result": 128
  },
  "result": 128,
  "statusCode": 200,
  "providerStatusCode": 200
}
```

---
