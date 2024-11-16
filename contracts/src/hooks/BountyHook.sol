// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {ISPHook} from "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {Attestation} from "lib/sign-protocol-evm/src/models/Attestation.sol";
import {AuditManager} from "src/AuditManager.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract BountyHook is ISPHook {
    address public admin;
    bytes32 public constant name = "bounty";
    uint64 public schema;
    mapping(uint256 => mapping(address => uint64)) public chainToContractToBounty;
    AuditManager public immutable aduitManager;
    ISP public immutable sp;

    modifier ownerSchemaOnly(uint64 schemaId) {
        require(schemaId == aduitManager.getSchemaId(name), "BountyHook/wrong-schema-id");
        _;
    }

    modifier auth() {
        require(msg.sender == admin, "BountyHook/not-authorized");
        _;
    }

    constructor(address _aduitManager, address _sp) {
        admin = _sp;
        sp = ISP(_sp);
        aduitManager = AuditManager(_aduitManager);
    }

    function _didReceiveAttestation(uint64 attestationId) private {
        Attestation memory a = sp.getAttestation(attestationId);
        (address contractAddress, uint chainId, ) = abi.decode(a.data, (address, uint, address));
        require(chainToContractToBounty[chainId][contractAddress] == 0, "BountyHook/bounty-already-exist-for-contract");
        chainToContractToBounty[chainId][contractAddress] = attestationId;
    }

    function didReceiveAttestation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    ) external auth ownerSchemaOnly(schemaId) {
        _didReceiveAttestation(attestationId);
    }

    function didReceiveAttestation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata // extraData
    ) external payable auth ownerSchemaOnly(schemaId) {
        _didReceiveAttestation(attestationId);
    }

    function _didReceiveRevocation(uint64 attestationId) private {
        Attestation memory a = sp.getAttestation(attestationId);
        (address contractAddress, uint chainId, ) = abi.decode(a.data, (address, uint, address));
        require(
            chainToContractToBounty[chainId][contractAddress] == attestationId,
            "BountyHook/attestation-id-does-not-match"
        );
        chainToContractToBounty[chainId][contractAddress] = 0;
    }

    function didReceiveRevocation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata // extraData
    ) external payable auth ownerSchemaOnly(schemaId) {
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

    function getBountyIdForContract(address contractAddress, uint chainId) external view returns (uint64) {
        return chainToContractToBounty[chainId][contractAddress];
    }
}
