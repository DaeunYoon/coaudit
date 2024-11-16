// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.18;

import { Script } from "forge-std/Script.sol";
import { Helpers } from "script/Helpers.s.sol";
import { DeployAll, DeployParams } from "script/dependencies/DeployAll.sol";

contract Deploy is Script {
    string private json;

    function setUp() public {
        json = Helpers.readInput();
    }

    function run() public {
        address signProtocol = vm.parseJsonAddress(json, ".SP");

        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));
        DeployAll.deploy(DeployParams({
            sp: signProtocol,
        }));
        vm.stopBroadcast();
    }
}
