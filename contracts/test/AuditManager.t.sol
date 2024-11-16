// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.18;

import { Test } from "forge-std/Test.sol";
import { DeployAll, DeployParams, DeployInstance } from "script/dependency/DeployAll.sol";
import { Helpers } from "script/Helpers.s.sol";

contract AuditManagerTest is Test {
    string private json;
    DeployInstance private instance;

    // Test users
    address private alice = address(0x111);
    address private bob = address(0x222);

    // Fallback receive functions
    receive() external payable {}
    fallback() external payable {}

    function setUp() public {
      json = Helpers.readInput();
      instance = DeployAll.deploy(DeployParams({
        sp: vm.parseJsonAddress(json, ".SP"),
        deployer: address(this)
      }));
    }

    function testAuditManagerAuth() public view {
      assertEq(address(instance.auditManager.admin()), address(address(this)));
    }

    function testAuditManagerSchema() public view {
      assertEq(instance.bountySchemaId, instance.auditManager.getSchemaId("bounty"));
    }

    function testCreateBounty() public {
      vm.expectRevert("AuditContrct/zero-bounty-amount");
      instance.auditManager.createBounty(1, address(this));

      uint64 bountyId = instance.auditManager.createBounty{ value: 1 ether }(1, address(this));

      vm.expectRevert("BountyHook/bounty-already-exist-for-contract");
      instance.auditManager.createBounty{ value: 1 ether }(1, address(this));

      assertEq(instance.auditManager.bountyIdToBalance(bountyId), 1 ether);
      assertEq(address(instance.auditManager).balance, 1 ether);

      uint256 beforeRefund = address(this).balance;
      instance.auditManager.refundBounty(bountyId);
      assertEq(instance.auditManager.bountyIdToBalance(bountyId), 0);
      assertEq(address(instance.auditManager).balance, 0);
      assertEq(address(this).balance, beforeRefund + 1 ether);
      assertEq(instance.auditManager.getBountyIdForContract(address(this), 1), 0);

      // Re-create bounty after revert
      bountyId = instance.auditManager.createBounty{ value: 1 ether }(1, address(this));
      assertEq(instance.auditManager.getBountyIdForContract(address(this), 1), bountyId);
    }
}
