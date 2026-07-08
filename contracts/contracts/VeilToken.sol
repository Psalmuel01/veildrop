// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title VeilToken
 * @author VeilDrop
 * @notice VeilDrop's own confidential token, vCTT. This is a demo token deployed
 * for the VeilDrop project, not a production asset, and holds no real value.
 * @dev Implements the ERC-7984 confidential fungible token standard on Zama's
 * fhEVM: balances and transfer amounts are stored as encrypted euint64 values,
 * readable in cleartext only by parties the FHEVM ACL has explicitly granted
 * access to. This contract inherits all confidential transfer, operator
 * approval, and balance logic from OpenZeppelin's ERC7984 reference
 * implementation, and inherits ZamaEthereumConfig to wire up the correct FHEVM
 * coprocessor, ACL, and KMS verifier addresses for whichever supported network
 * it is deployed to (Ethereum mainnet, Sepolia, or a local FHEVM mock).
 *
 * Minting is fully open and permissionless, mirroring a standard testnet
 * faucet, so anyone testing VeilDrop can mint their own confidential balance
 * without needing admin permission. There is no access control on
 * {mintConfidential} by design.
 */
contract VeilToken is ERC7984, ZamaEthereumConfig {
    /// @notice Emitted when confidential vCTT is minted to `to`.
    /// @param to Recipient credited with the minted balance.
    /// @param amount Plaintext amount minted, in vCTT's 6-decimal units. The
    /// mint amount itself is public, only the resulting balance is encrypted.
    event TokensMinted(address indexed to, uint64 amount);

    constructor() ERC7984("VeilDrop Confidential Token", "vCTT", "") {}

    /**
     * @notice Mint confidential vCTT to `to`. Open and permissionless, for
     * demo and testing purposes only.
     * @dev Wraps the plaintext `amount` into a trivially encrypted euint64 via
     * {FHE.asEuint64} and credits it through the inherited {ERC7984-_mint}.
     * The amount is passed and emitted as plaintext, matching how a testnet
     * faucet's mint amount is public even though the resulting balance and
     * later transfers are confidential.
     * @param to Recipient of the minted balance. Reverts via {ERC7984-_mint}
     * if the zero address.
     * @param amount Plaintext amount to mint, in vCTT's 6-decimal units.
     */
    function mintConfidential(address to, uint64 amount) public {
        _mint(to, FHE.asEuint64(amount));
        emit TokensMinted(to, amount);
    }
}
