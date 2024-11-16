// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {DataLocation} from "lib/sign-protocol-evm/src/models/DataLocation.sol";
import {Attestation} from "lib/sign-protocol-evm/src/models/Attestation.sol";

interface BountyHook {
    function getBountyIdForContract(address contractAddress, uint chainId) external view returns (uint64);
}

// @dev This contract manages attestation data validation logic.
contract AuditManager {
    address public admin;
    mapping(bytes32 => uint64) public schemaToId;
    mapping(bytes32 => address) public schemaToHook;
    ISP private sp;

    // --- Events ---
    event CreatedBounty(
        uint64 attestationId, uint chainId, address indexed contractAddress, address indexed attester
    );

    constructor(address _sp) {
        admin = msg.sender;
        sp = ISP(_sp);
    }

    modifier auth() {
        require(admin == msg.sender, "AuditContract/not-authorized");
        _;
    }

    function setSchema(bytes32 schemaName, uint64 schemaId) external auth {
        schemaToId[schemaName] = schemaId;
        schemaToHook[schemaName] = address(sp.getSchema(schemaId).hook);
    }

    function getSchemaId(bytes32 name) external view returns (uint64) {
        return schemaToId[name];
    }

    function getBountyIdForContract(address contractAddress, uint chainId) public view returns (uint64) {
        return BountyHook(schemaToHook["bounty"]).getBountyIdForContract(contractAddress, chainId);
    }
}
