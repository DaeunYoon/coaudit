// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.18;

struct DeployParams {
  address sp;
}

struct DeployInstance {

}

library DeployAll {
  function deploy(DeployParams memory params) internal returns (DeployInstance memory instance) {
    // 1. create Report / Bounty / ReportStatus Schema
    
    // 2. create Bounty Contract 
  }
} 