// SPDX-License-Identifier: Apache-2.0
/*

  Copyright 2020 ZeroEx Intl.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

*/

pragma solidity ^0.6.5;
pragma experimental ABIEncoderV2;

import "../Router.sol";
import "../features/interfaces/IOwnableFeature.sol";
import "../features/TransformERC20Feature.sol";
import "./InitialMigration.sol";


/// @dev A contract for deploying and configuring the full Router contract.
contract FullMigration {

    // solhint-disable no-empty-blocks,indent

    /// @dev Features to add the the proxy contract.
    struct Features {
        SimpleFunctionRegistryFeature registry;
        OwnableFeature ownable;
        TransformERC20Feature transformERC20;
    }

    /// @dev Parameters needed to initialize features.
    struct MigrateOpts {
        address transformerDeployer;
    }

    /// @dev The allowed caller of `initializeRouter()`.
    address public immutable initializeCaller;
    /// @dev The initial migration contract.
    InitialMigration private _initialMigration;

    /// @dev Instantiate this contract and set the allowed caller of `initializeRouter()`
    ///      to `initializeCaller`.
    /// @param initializeCaller_ The allowed caller of `initializeRouter()`.
    constructor(address payable initializeCaller_)
        public
    {
        initializeCaller = initializeCaller_;
        // Create an initial migration contract with this contract set to the
        // allowed `initializeCaller`.
        _initialMigration = new InitialMigration(address(this));
    }

    /// @dev Retrieve the bootstrapper address to use when constructing `Router`.
    /// @return bootstrapper The bootstrapper address.
    function getBootstrapper()
        external
        view
        returns (address bootstrapper)
    {
        return address(_initialMigration);
    }

    /// @dev Initialize the `Router` contract with the full feature set,
    ///      transfer ownership to `owner`, then self-destruct.
    /// @param owner The owner of the contract.
    /// @param router The instance of the Router contract. Router should
    ///        been constructed with this contract as the bootstrapper.
    /// @param features Features to add to the proxy.
    /// @return _router The configured Router contract. Same as the `router` parameter.
    /// @param migrateOpts Parameters needed to initialize features.
    function migrateRouter(
        address payable owner,
        Router router,
        Features memory features,
        MigrateOpts memory migrateOpts
    )
        public
        returns (Router _router)
    {
        require(msg.sender == initializeCaller, "FullMigration/INVALID_SENDER");

        // Perform the initial migration with the owner set to this contract.
        _initialMigration.initializeRouter(
            address(uint160(address(this))),
            router,
            InitialMigration.BootstrapFeatures({
                registry: features.registry,
                ownable: features.ownable
            })
        );

        // Add features.
        _addFeatures(router, features, migrateOpts);

        // Transfer ownership to the real owner.
        IOwnableFeature(address(router)).transferOwnership(owner);

        // Self-destruct.
        this.die(owner);

        return router;
    }

    /// @dev Destroy this contract. Only callable from ourselves (from `initializeRouter()`).
    /// @param ethRecipient Receiver of any ETH in this contract.
    function die(address payable ethRecipient)
        external
        virtual
    {
        require(msg.sender == address(this), "FullMigration/INVALID_SENDER");
        // This contract should not hold any funds but we send
        // them to the ethRecipient just in case.
        selfdestruct(ethRecipient);
    }

    /// @dev Deploy and register features to the Router contract.
    /// @param router The bootstrapped Router contract.
    /// @param features Features to add to the proxy.
    /// @param migrateOpts Parameters needed to initialize features.
    function _addFeatures(
        Router router,
        Features memory features,
        MigrateOpts memory migrateOpts
    )
        private
    {
        IOwnableFeature ownable = IOwnableFeature(address(router));
        // TransformERC20Feature
        {
            // Register the feature.
            ownable.migrate(
                address(features.transformERC20),
                abi.encodeWithSelector(
                    TransformERC20Feature.migrate.selector,
                    migrateOpts.transformerDeployer
                ),
                address(this)
            );
        }
    }
}
