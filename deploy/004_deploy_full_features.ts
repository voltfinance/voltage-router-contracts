import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const {WFUSE_ADDRESS} = process.env;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts} = hre;
	const {deploy, get} = deployments;

	const {deployer} = await getNamedAccounts();

	await deploy('SimpleFunctionRegistryFeature', {
		from: deployer,
		log: true,
		autoMine: true,
	});

	await deploy('OwnableFeature', {
		from: deployer,
		log: true,
		autoMine: true,
	});

	await deploy('TransformERC20Feature', {
		from: deployer,
		log: true,
		autoMine: true,
	});
};
export default func;
func.tags = ['Features'];
