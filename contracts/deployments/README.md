Deployment records land here after running `npm run deploy:sepolia`.

`sepolia.json` does not exist yet. It is created automatically by
`scripts/deploy.ts` the first time VeilToken is deployed to Sepolia, in this
shape:

```json
{
  "address": "0x...",
  "deployedAt": "2026-01-01T00:00:00.000Z",
  "txHash": "0x...",
  "network": "sepolia"
}
```
