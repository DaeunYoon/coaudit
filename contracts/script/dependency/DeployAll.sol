// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.18;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {ISPHook} from "lib/sign-protocol-evm/src/interfaces/ISPHook.sol";
import {Schema} from "lib/sign-protocol-evm/src/models/Schema.sol";
import {DataLocation} from "lib/sign-protocol-evm/src/models/DataLocation.sol";
import {BountyHook} from "src/hooks/BountyHook.sol";
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
          data: '[{"name":"contractAddress","type": "address"},{"name":"chainId","type":"uint"},{"name":"owner","type":"address"}]'
        });

        instance.bountySchemaId = sp.register(bountySchema, new bytes(0));

        Schema memory reportSchema = Schema({
            registrant: params.deployer,
            revocable: true,
            dataLocation: DataLocation.ONCHAIN,
            maxValidFor: 0,
            // TODO: Signature can be created only when active bounty program exist
            hook: ISPHook(address(0)),
            timestamp: uint64(block.timestamp),
            data: '[{"name":"bountyId","type":"uint64"},{"name":"finding","type":"string"}]'
        });

        instance.reportSchemaId = sp.register(reportSchema, new bytes(0));

        Schema memory reportStatusSchema = Schema({
            registrant: params.deployer,
            revocable: true,
            dataLocation: DataLocation.ONCHAIN,
            maxValidFor: 0,
            // TODO: only original bounty owner can create
            // TODO: only one can be created for each reportSchema
            hook: ISPHook(address(0)),
            timestamp: uint64(block.timestamp),
            data: '[{"name":"reportId","type": "uint64"},{"name":"isAccepted","type":"bool"}]'
        });

        instance.reportStatusSchemaId = sp.register(reportStatusSchema, new bytes(0));

        // 3. Setup schemaIds to AuditManager
        instance.auditManager.setSchema("bounty", instance.bountySchemaId);
        instance.auditManager.setSchema("report", instance.reportSchemaId);
        instance.auditManager.setSchema("reportStatus", instance.reportStatusSchemaId);
    }
}
