// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {ISPHook} from "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {Attestation} from "lib/sign-protocol-evm/src/models/Attestation.sol";
import {IAuditManager} from "src/IAuditManager.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IBountyHook} from "src/hooks/IBountyHook.sol";

contract ReportStatusHook is ISPHook {
    bytes32 public constant name = "reportStatus";
    address public admin;
    uint64 public schema;
    mapping(uint64 => uint64) public reportToReportStatus;
    IAuditManager public immutable aduitManager;
    ISP public immutable sp;

    modifier ownerSchemaOnly(uint64 schemaId) {
        require(schemaId == aduitManager.getSchemaId(name), "ReportStatusHook/wrong-schema-id");
        _;
    }

    modifier auth() {
        require(msg.sender == admin, "ReportStatusHook/not-authorized");
        _;
    }

    constructor(address _aduitManager, address _sp) {
        admin = _sp;
        sp = ISP(_sp);
        aduitManager = IAuditManager(_aduitManager);
    }

    function _didReceiveAttestation(uint64 attestationId) private {
        Attestation memory a = sp.getAttestation(attestationId);
        uint64 reportId = a.linkedAttestationId;
        (uint256 amount) = abi.decode(a.data, (uint256));
        require(reportToReportStatus[reportId] == 0, "ReportStatusHook/report-already-has-status");
        
        Attestation memory report = sp.getAttestation(reportId);
        require(report.schemaId == aduitManager.getSchemaId("report"), "ReportStatusHook/report-not-exist");  
        require(!report.revoked, "ReportStatusHook/report-revoked");
       
        uint64 bountyId = report.linkedAttestationId;

        Attestation memory bounty = sp.getAttestation(bountyId);
        require(!bounty.revoked, "ReportStatusHook/bounty-inactivated");
        require(a.attester == bounty.attester, "ReportStatusHook/unauthorized-bounty-owner");

        reportToReportStatus[reportId] = attestationId;
        if (amount > 0) {
          IBountyHook bountyHook = IBountyHook(aduitManager.schemaToHook("bounty"));
          bountyHook.rewardBounty(bountyId, report.attester, amount);
        }
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
      (uint256 amount) = abi.decode(a.data, (uint256));
      require(
          reportToReportStatus[a.linkedAttestationId] != 0,
          "ReportStatusHook/attestation-id-does-not-match"
      );
      require(amount == 0, "ReportStatusHook/report-already-rewarded");
      reportToReportStatus[a.linkedAttestationId] = 0;
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

    function getReportStatusIdForReport(uint64 report) external view returns (uint64) {
        return reportToReportStatus[report];
    }
}