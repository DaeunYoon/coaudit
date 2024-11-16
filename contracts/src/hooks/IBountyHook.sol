// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

interface IBountyHook {
    // Events
    event ReceivedAttestation(address indexed attester, uint64 schemaId, uint64 attestationId);
    event RevocationReceived(address indexed attester, uint64 schemaId, uint64 attestationId);

    // Functions
    function rely(address usr) external;
    function deny(address usr) external;
    
    function didReceiveAttestation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata extraData
    ) external payable;

    function didReceiveRevocation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata extraData
    ) external payable;

    function didReceiveRevocation(
        address attester,
        uint64 schemaId,
        uint64 attestationId,
        IERC20 resolverFeeERC20Token,
        uint256 resolverFeeERC20Amount,
        bytes calldata extraData
    ) external;

    function rewardBounty(uint64 bountyId, address to, uint256 amount) external;

    function getBountyIdForContract(address contractAddress, uint chainId) external view returns (uint64);
    
    function getBountyBalance(uint64 bountyId) external view returns (uint256);

    function wards(address) external view returns (uint64);
}