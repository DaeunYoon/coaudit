// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {ISPHook} from "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {Attestation} from "lib/sign-protocol-evm/src/models/Attestation.sol";
import {AuditManager} from "src/AuditManager.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract BountyHook is ISPHook {
    bytes32 public constant name = "bounty";
    uint64 public schema;
    mapping(address => uint64) public wards;
    mapping(uint256 => mapping(address => uint64)) public chainToContractToBounty;
    mapping(uint64 => uint256) public bountyIdToBalance;
    AuditManager public immutable aduitManager;
    ISP public immutable sp;

    modifier ownerSchemaOnly(uint64 schemaId) {
        require(schemaId == aduitManager.getSchemaId(name), "BountyHook/wrong-schema-id");
        _;
    }

    modifier auth() {
        require(wards[msg.sender] == 1, "BountyHook/not-authorized");
        _;
    }

    constructor(address _aduitManager, address _sp) {
        wards[msg.sender] = 1;
        wards[_sp] = 1;
        sp = ISP(_sp);
        aduitManager = AuditManager(_aduitManager);
    }

    function rely(address usr) external auth {
        wards[usr] = 1;
    }

    function deny(address usr) external auth {
        wards[usr] = 0;
    }

    function didReceiveAttestation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    ) external pure {
        revert("BountyHook/unsupported");
    }

    function didReceiveAttestation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata // extraData
    ) external payable ownerSchemaOnly(schemaId) {
        uint256 amount = msg.value;
        require(amount > 0, "BountyHook/zero-bounty-amount");

        Attestation memory a = sp.getAttestation(attestationId);
        (address contractAddress, uint256 chainId, ) = abi.decode(a.data, (address, uint256, string));
        require(chainToContractToBounty[chainId][contractAddress] == 0, "BountyHook/bounty-already-exist-for-contract");
        chainToContractToBounty[chainId][contractAddress] = attestationId;
        bountyIdToBalance[attestationId] = amount;
    }

    function _didReceiveRevocation(uint64 attestationId) private {
        Attestation memory a = sp.getAttestation(attestationId);
        (address contractAddress, uint256 chainId, ) = abi.decode(a.data, (address, uint256, string));
        
        require(
            chainToContractToBounty[chainId][contractAddress] == attestationId,
            "BountyHook/attestation-id-does-not-match"
        );
        
        uint256 amount = bountyIdToBalance[attestationId];
        (bool success, ) = payable(a.attester).call{value: amount}("");
        require(success, "BountyHook/transfer-failed");

        chainToContractToBounty[chainId][contractAddress] = 0;
        bountyIdToBalance[attestationId] = 0;
    }

    function didReceiveRevocation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata // extraData
    ) external payable ownerSchemaOnly(schemaId) {
        _didReceiveRevocation(attestationId);
    }

    function didReceiveRevocation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    ) external auth ownerSchemaOnly(schemaId) {
        _didReceiveRevocation(attestationId);
    }

    function rewardBounty(uint64 bountyId, address to, uint256 amount) external auth {
        require(bountyIdToBalance[bountyId] >= amount, "BountyHook/insufficient-balance");
        bountyIdToBalance[bountyId] -= amount;
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "BountyHook/transfer-failed");
    }

    function getBountyIdForContract(address contractAddress, uint chainId) external view returns (uint64) {
        return chainToContractToBounty[chainId][contractAddress];
    }

    function getBountyBalance(uint64 bountyId) external view returns (uint256) {
        return bountyIdToBalance[bountyId];
    }
}
