LIVE SERVER: https://server.lync.world/

TEST Server: https://testanalyticserver.lync.world/

> Install [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

- Clone the Project
- Run `nvm use 18`
- Install Node Modules `npm install`
- create `.env` file
- add `MONGO_URL` in `.env` file
- run `npm start`

- Routes

  - `/user/insert`

    - body:
      - email
      - walletAddress
      - name
      - gameName
      - gameDescription
    - response:
      - apiKey

  - `/user/insert_gamer_details`

    - body:
      - walletAddress
      - apiKey # Analytics-API
      - productName

  - `/user/check_api_key`
    - body:
      - apiKey

  <!-- PRODUCT Versioning-->

  GET REQUEST FOR Version: http://localhost:7410/versioning/get

  - `versioning/all`

  POST REQUEST FOR NEW PRODUCT AND VERSION: http://localhost:7410/versioning/insert

  - `versioning/insert`
    - body:
      - productName
      - version

  Example: {"productName":"OKXWallet","version":"1.0.0"}

  POST REQUEST FOR NEW PRODUCT AND VERSION: http://localhost:7410/versioning/update

GET REQ for version details of a specific version

- `versioning/get?productName=`
  - body:
    - version

Example: http://localhost:7410/versioning/get?productName=OKXWallet
{"version":"1.0.0"}

- Node >=18

- .env

```
MONGODB_URL=
```
