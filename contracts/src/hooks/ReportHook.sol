// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {ISPHook} from "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {Attestation} from "lib/sign-protocol-evm/src/models/Attestation.sol";
import {AuditManager} from "src/AuditManager.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract ReportHook is ISPHook {
    address public admin;
    bytes32 public constant name = "report";
    uint64 public schema;
    AuditManager public immutable aduitManager;
    ISP public immutable sp;

    modifier ownerSchemaOnly(uint64 schemaId) {
        require(schemaId == aduitManager.getSchemaId(name), "ReportHook/wrong-schema-id");
        _;
    }

    modifier auth() {
        require(msg.sender == admin, "ReportHook/not-authorized");
        _;
    }

    constructor(address _aduitManager, address _sp) {
        admin = _sp;
        sp = ISP(_sp);
        aduitManager = AuditManager(_aduitManager);
    }

    function _isValidBounty(uint64 bountyId) private view returns (bool) {
        Attestation memory a = sp.getAttestation(bountyId);
        return a.schemaId == aduitManager.getSchemaId("bounty") && !a.revoked;
    }

    function _didReceiveAttestation(uint64 attestationId) private view {
        Attestation memory a = sp.getAttestation(attestationId);
        require(_isValidBounty(a.linkedAttestationId) == true, "ReportHook/bounty-not-exist");
    }

    function didReceiveAttestation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    ) external view ownerSchemaOnly(schemaId) {
        _didReceiveAttestation(attestationId);
    }

    function didReceiveAttestation(
        address, // attester
        uint64 schemaId,
        uint64 attestationId,
        bytes calldata // extraData
    ) external payable ownerSchemaOnly(schemaId) {
        _didReceiveAttestation(attestationId);
    }

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        bytes calldata // extraData
    ) external payable {}

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    ) external pure {}
}
