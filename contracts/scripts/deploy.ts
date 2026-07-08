import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploys VeilToken and records the result at
 * contracts/deployments/<network>.json. Run with:
 *
 *   npm run deploy:sepolia
 *
 * or directly:
 *
 *   npx hardhat run scripts/deploy.ts --network sepolia
 *
 * Requires SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY set in contracts/.env,
 * see contracts/.env.example. The deployer account needs Sepolia ETH for gas.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account configured for this network. Set SEPOLIA_PRIVATE_KEY in contracts/.env.");
  }

  console.log(`Deploying VeilToken to ${network.name} from ${deployer.address}`);

  const factory = await ethers.getContractFactory("VeilToken");
  const veilToken = await factory.deploy();
  const deployTx = veilToken.deploymentTransaction();
  if (!deployTx) {
    throw new Error("Deployment transaction was not found, deploy may not have broadcast.");
  }

  await veilToken.waitForDeployment();
  const address = await veilToken.getAddress();

  console.log("VeilToken deployed.");
  console.log(`Address: ${address}`);
  console.log(`Tx hash: ${deployTx.hash}`);

  const record = {
    address,
    deployedAt: new Date().toISOString(),
    txHash: deployTx.hash,
    network: network.name,
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(record, null, 2) + "\n");

  console.log(`Deployment record written to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
