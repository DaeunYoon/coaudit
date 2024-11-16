// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.18;

import { Test } from "forge-std/Test.sol";
import { DeployAll, DeployParams, DeployInstance } from "script/dependency/DeployAll.sol";
import { Helpers } from "script/Helpers.s.sol";
import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {Attestation} from "lib/sign-protocol-evm/src/models/Attestation.sol";
import {DataLocation} from "lib/sign-protocol-evm/src/models/DataLocation.sol";
import {IBountyHook} from "src/hooks/IBountyHook.sol";

contract AuditManagerTest is Test {
    string private json;
    DeployInstance private instance;
    ISP public sp; 
    IBountyHook bountyHook;

    // Test users
    address private alice = address(0x111);
    address private bob = address(0x222);

    // Fallback receive functions
    receive() external payable {}
    fallback() external payable {}

    function setUp() public {
      json = Helpers.readInput();
      sp = ISP(vm.parseJsonAddress(json, ".SP"));
      instance = DeployAll.deploy(DeployParams({
        sp: address(sp),
        deployer: address(this)
      }));
      bountyHook = IBountyHook(instance.auditManager.schemaToHook("bounty"));
    }

    function testBountyHookAuth() public view {
      assertEq(bountyHook.wards(address(this)), 1);
      assertEq(bountyHook.wards(instance.auditManager.schemaToHook("reportStatus")), 1);
    }

    function testAuditManagerSchema() public view {
      assertEq(instance.bountySchemaId, instance.auditManager.getSchemaId("bounty"));
      assertEq(instance.reportSchemaId, instance.auditManager.getSchemaId("report"));
      assertEq(instance.reportStatusSchemaId, instance.auditManager.getSchemaId("reportStatus"));
    }

    function testCreateBounty() public {
      Attestation memory bountyAttestation = Attestation({
          schemaId: instance.auditManager.getSchemaId("bounty"),
          linkedAttestationId: 0,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode(address(this), 1, "title")
      });

      vm.expectRevert("BountyHook/zero-bounty-amount");
      sp.attest(bountyAttestation, "", "", "");

      uint64 bountyId = sp.attest{value: 1 ether}(bountyAttestation, 1 ether, "", "", "");
      assertEq(bountyHook.getBountyIdForContract(address(this), 1), bountyId);

      vm.expectRevert("BountyHook/bounty-already-exist-for-contract");
      sp.attest{value: 1 ether}(bountyAttestation, 1 ether, "", "", "");

      assertEq(bountyHook.getBountyBalance(bountyId), 1 ether);
      assertEq(address(bountyHook).balance, 1 ether);

      uint256 beforeRevoke = address(this).balance;
      sp.revoke(bountyId, "", "", "");
      assertEq(bountyHook.getBountyBalance(bountyId), 0);
      assertEq(address(bountyHook).balance, 0);
      assertEq(address(this).balance, beforeRevoke + 1 ether);
      assertEq(bountyHook.getBountyIdForContract(address(this), 1), 0);

      // Re-create bounty after revert
      bountyId = sp.attest{value: 1 ether}(bountyAttestation, 1 ether, "", "", "");
      assertEq(bountyHook.getBountyIdForContract(address(this), 1), bountyId);
    }

    function testCreateReport() public {
      uint64 bountyId = sp.attest{value: 1 ether}(Attestation({
          schemaId: instance.auditManager.getSchemaId("bounty"),
          linkedAttestationId: 0,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode(1, address(this), "title")
      }), 1 ether, "", "", "");

      uint64 reportId = sp.attest(Attestation({
          schemaId: instance.auditManager.getSchemaId("report"),
          linkedAttestationId: bountyId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode("finding")
      }), "", "", "");

      Attestation memory reportAttestation = Attestation({
          schemaId: instance.auditManager.getSchemaId("report"),
          linkedAttestationId: reportId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode("finding")
      });

      vm.expectRevert("ReportHook/bounty-not-exist");
      sp.attest(reportAttestation, "", "", "");
    }

    function testCreateReportStatus() public {
      uint64 bountyId = sp.attest{value: 1 ether}(Attestation({
          schemaId: instance.auditManager.getSchemaId("bounty"),
          linkedAttestationId: 0,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode(1, address(this), "title")
      }), 1 ether, "", "", "");

      uint64 reportId = sp.attest(Attestation({
          schemaId: instance.auditManager.getSchemaId("report"),
          linkedAttestationId: bountyId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode("finding")
      }), "", "", "");

      Attestation memory reportStatusAttestation = Attestation({
          schemaId: instance.auditManager.getSchemaId("reportStatus"),
          linkedAttestationId: reportId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode(0.5 ether)
      });

      uint256 beforeBalance = address(this).balance;
      sp.attest(reportStatusAttestation, "", "", "");

      assertEq(bountyHook.getBountyBalance(bountyId), 0.5 ether);
      assertEq(address(this).balance, beforeBalance + 0.5 ether);

      vm.expectRevert("ReportStatusHook/report-already-has-status");
      sp.attest(reportStatusAttestation, "", "", "");

      reportId = sp.attest(Attestation({
          schemaId: instance.auditManager.getSchemaId("report"),
          linkedAttestationId: bountyId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode("finding")
      }), "", "", "");

      reportStatusAttestation = Attestation({
          schemaId: instance.auditManager.getSchemaId("reportStatus"),
          linkedAttestationId: reportId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: alice,
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode(true)
      });

    //   vm.startPrank(alice);
    //   vm.expectRevert("ReportStatusHook/unauthorized-bounty-owner");
    //   sp.attest(reportStatusAttestation, "", "", "");
    //   vm.stopPrank();

      sp.revoke(bountyId, "", "", "");
      
      reportStatusAttestation = Attestation({
          schemaId: instance.auditManager.getSchemaId("reportStatus"),
          linkedAttestationId: reportId,
          attestTimestamp: 0,
          revokeTimestamp: 0,
          attester: address(this),
          validUntil: 0,
          dataLocation: DataLocation.ONCHAIN,
          revoked: false,
          recipients: new bytes[](0),
          data: abi.encode(true)
      });

      vm.expectRevert("ReportStatusHook/bounty-inactivated");
      sp.attest(reportStatusAttestation, "", "", "");
    }
}
