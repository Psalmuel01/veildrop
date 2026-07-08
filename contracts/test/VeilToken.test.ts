import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import type { VeilToken } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

const ONE_VCTT = 1_000_000n; // 1 vCTT, 6 decimals

async function deployFixture() {
  const factory = await ethers.getContractFactory("VeilToken");
  const veilToken = (await factory.deploy()) as unknown as VeilToken;
  const veilTokenAddress = await veilToken.getAddress();
  return { veilToken, veilTokenAddress };
}

describe("VeilToken", function () {
  let signers: Signers;
  let veilToken: VeilToken;
  let veilTokenAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // This suite exercises real FHE operations, which only run against the
    // local FHEVM mock coprocessor. Sepolia has its own asynchronous
    // decryption flow that does not fit this synchronous test style.
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite cannot run on Sepolia Testnet");
      this.skip();
    }

    ({ veilToken, veilTokenAddress } = await deployFixture());
  });

  describe("metadata", function () {
    it("reports the expected name, symbol, and decimals", async function () {
      expect(await veilToken.name()).to.eq("VeilDrop Confidential Token");
      expect(await veilToken.symbol()).to.eq("vCTT");
      expect(await veilToken.decimals()).to.eq(6);
    });
  });

  describe("mintConfidential", function () {
    it("credits the caller's own encrypted balance", async function () {
      await (await veilToken.connect(signers.alice).mintConfidential(signers.alice.address, ONE_VCTT)).wait();

      const encryptedBalance = await veilToken.confidentialBalanceOf(signers.alice.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        veilTokenAddress,
        signers.alice,
      );

      expect(clearBalance).to.eq(ONE_VCTT);
    });

    it("is open and permissionless, any caller can mint to any recipient", async function () {
      await (await veilToken.connect(signers.alice).mintConfidential(signers.bob.address, ONE_VCTT * 2n)).wait();

      const encryptedBalance = await veilToken.confidentialBalanceOf(signers.bob.address);
      const clearBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        encryptedBalance,
        veilTokenAddress,
        signers.bob,
      );

      expect(clearBalance).to.eq(ONE_VCTT * 2n);
    });

    it("emits TokensMinted with the recipient and plaintext amount", async function () {
      await expect(veilToken.connect(signers.alice).mintConfidential(signers.bob.address, ONE_VCTT))
        .to.emit(veilToken, "TokensMinted")
        .withArgs(signers.bob.address, ONE_VCTT);
    });
  });

  describe("confidential transfer", function () {
    it("moves balance from sender to recipient", async function () {
      await (await veilToken.connect(signers.alice).mintConfidential(signers.alice.address, ONE_VCTT * 10n)).wait();

      const encryptedTransfer = await fhevm
        .createEncryptedInput(veilTokenAddress, signers.alice.address)
        .add64(ONE_VCTT * 3n)
        .encrypt();

      await (
        await veilToken
          .connect(signers.alice)
          ["confidentialTransfer(address,bytes32,bytes)"](
            signers.bob.address,
            encryptedTransfer.handles[0],
            encryptedTransfer.inputProof,
          )
      ).wait();

      const aliceClear = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        await veilToken.confidentialBalanceOf(signers.alice.address),
        veilTokenAddress,
        signers.alice,
      );
      const bobClear = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        await veilToken.confidentialBalanceOf(signers.bob.address),
        veilTokenAddress,
        signers.bob,
      );

      expect(aliceClear).to.eq(ONE_VCTT * 7n);
      expect(bobClear).to.eq(ONE_VCTT * 3n);
    });
  });

  describe("operator approval", function () {
    it("lets an approved operator move tokens on the holder's behalf", async function () {
      await (await veilToken.connect(signers.alice).mintConfidential(signers.alice.address, ONE_VCTT * 5n)).wait();

      const until = (await ethers.provider.getBlock("latest"))!.timestamp + 3600;
      await (await veilToken.connect(signers.alice).setOperator(signers.deployer.address, until)).wait();

      expect(await veilToken.isOperator(signers.alice.address, signers.deployer.address)).to.eq(true);

      const encryptedTransfer = await fhevm
        .createEncryptedInput(veilTokenAddress, signers.deployer.address)
        .add64(ONE_VCTT * 2n)
        .encrypt();

      await (
        await veilToken
          .connect(signers.deployer)
          ["confidentialTransferFrom(address,address,bytes32,bytes)"](
            signers.alice.address,
            signers.bob.address,
            encryptedTransfer.handles[0],
            encryptedTransfer.inputProof,
          )
      ).wait();

      const bobClear = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        await veilToken.confidentialBalanceOf(signers.bob.address),
        veilTokenAddress,
        signers.bob,
      );

      expect(bobClear).to.eq(ONE_VCTT * 2n);
    });

    it("rejects a transferFrom from a non-approved spender", async function () {
      await (await veilToken.connect(signers.alice).mintConfidential(signers.alice.address, ONE_VCTT)).wait();

      const encryptedTransfer = await fhevm
        .createEncryptedInput(veilTokenAddress, signers.bob.address)
        .add64(ONE_VCTT)
        .encrypt();

      await expect(
        veilToken
          .connect(signers.bob)
          ["confidentialTransferFrom(address,address,bytes32,bytes)"](
            signers.alice.address,
            signers.bob.address,
            encryptedTransfer.handles[0],
            encryptedTransfer.inputProof,
          ),
      ).to.be.revertedWithCustomError(veilToken, "ERC7984UnauthorizedSpender");
    });
  });

  describe("ERC-7984 interface compatibility", function () {
    it("supports ERC-165 introspection, the interface the TokenOps SDK checks tokens against", async function () {
      // 0x01ffc9a7 is the fixed ERC-165 interface id itself, every
      // ERC-165-compliant contract must return true for its own check.
      expect(await veilToken.supportsInterface("0x01ffc9a7")).to.eq(true);
    });

    it("exposes the standard confidential balance and operator reads the SDK relies on", async function () {
      expect(await veilToken.confidentialBalanceOf(signers.alice.address)).to.eq(ethers.ZeroHash);
      expect(await veilToken.isOperator(signers.alice.address, signers.alice.address)).to.eq(true);
    });
  });
});
