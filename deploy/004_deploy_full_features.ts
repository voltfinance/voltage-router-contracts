import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const {WFUSE_ADDRESS} = process.env;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts} = hre;
	const {deploy, get} = deployments;

	const {deployer} = await getNamedAccounts();

	const {address: zeroExAddress} = await get('ZeroEx');

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

	await deploy('MetaTransactionsFeature', {
		from: deployer,
		log: true,
		args: [zeroExAddress],
		autoMine: true,
	});

	const feeCollectorController = await deploy('FeeCollectorController', {
		from: deployer,
		log: true,
		args: [WFUSE_ADDRESS, ZERO_ADDRESS],
		autoMine: true,
	});

	await deploy('NativeOrdersFeature', {
		from: deployer,
		log: true,
		args: [zeroExAddress, WFUSE_ADDRESS, ZERO_ADDRESS, feeCollectorController.address, 70e3],
		autoMine: true,
	});

	await deploy('OtcOrdersFeature', {
		from: deployer,
		log: true,
		args: [zeroExAddress, WFUSE_ADDRESS],
		autoMine: true,
	});
};
export default func;
func.tags = ['Features'];
func.dependencies = ['ZeroEx'];
