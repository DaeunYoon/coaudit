// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.18;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {ISPHook} from "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {Schema} from "lib/sign-protocol-evm/src/models/Schema.sol";
import {DataLocation} from "lib/sign-protocol-evm/src/models/DataLocation.sol";
import {BountyHook} from "src/hooks/BountyHook.sol";
import {ReportHook} from "src/hooks/ReportHook.sol";
import {ReportStatusHook} from "src/hooks/ReportStatusHook.sol";
import {AuditManager} from "src/AuditManager.sol";
import {console} from "forge-std/console.sol";

struct DeployParams {
    address deployer;
    address sp;
}

struct DeployInstance {
    AuditManager auditManager;
    uint64 bountySchemaId;
    uint64 reportSchemaId;
    uint64 reportStatusSchemaId;
}

library DeployAll {
    function deploy(DeployParams memory params) internal returns (DeployInstance memory instance) {
        ISP sp = ISP(params.sp);

        // 1. Create AuditManager
        instance.auditManager = new AuditManager(params.sp);

        // 2. Create Bounty / Report / ReportStatus Schema
        BountyHook bountyHook = new BountyHook(address(instance.auditManager), params.sp);

        Schema memory bountySchema = Schema({
          registrant: params.deployer,
          revocable: true,
          dataLocation: DataLocation.ONCHAIN,
          maxValidFor: 0,
          hook: bountyHook,
          timestamp: uint64(block.timestamp),
          data: '{"name":"bounty","description":"Bug bounty for smart contract","data":[{"name":"contractAddress","type":"address"},{"name":"chainId","type":"uint256"},{"name":"title","type":"string"}]}'
        });

        instance.bountySchemaId = sp.register(bountySchema, new bytes(0));

        ReportHook reportHook = new ReportHook(address(instance.auditManager), params.sp);
        // linkedAttestationId is the attestationId of the bounty
        Schema memory reportSchema = Schema({
            registrant: params.deployer,
            revocable: true,
            dataLocation: DataLocation.ONCHAIN,
            maxValidFor: 0,
            hook: reportHook,
            timestamp: uint64(block.timestamp),
            data: '{"name":"report","description":"Bug report for bounty","data":[{"name":"finding","type":"string"}]}'
        });

        instance.reportSchemaId = sp.register(reportSchema, new bytes(0));

        ReportStatusHook reportStatusHook = new ReportStatusHook(address(instance.auditManager), params.sp);
        // linkedAttestationId is the attestationId of the report
        Schema memory reportStatusSchema = Schema({
            registrant: params.deployer,
            revocable: true,
            dataLocation: DataLocation.ONCHAIN,
            maxValidFor: 0,
            hook: reportStatusHook,
            timestamp: uint64(block.timestamp),
            data: '{"name":"reportStatus","description":"Bug bounty report status","data":[{"name":"amount","type":"uint256"}]}'
        });

        instance.reportStatusSchemaId = sp.register(reportStatusSchema, new bytes(0));

        // 3. Setup schemaIds to AuditManager
        instance.auditManager.setSchema("bounty", instance.bountySchemaId);
        instance.auditManager.setSchema("report", instance.reportSchemaId);
        instance.auditManager.setSchema("reportStatus", instance.reportStatusSchemaId);

        // 4. Set `reportStatusHook` as admin for `bountyHook`
        bountyHook.rely(address(reportStatusHook));
    }
}
