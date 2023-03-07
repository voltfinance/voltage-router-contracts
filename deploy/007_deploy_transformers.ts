import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const {WFUSE_ADDRESS} = process.env;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts, ethers} = hre;
	const {deploy, get} = deployments;
	const {deployer} = await getNamedAccounts();

	const {address: zeroExAddress} = await get('ZeroEx');

	const {address: bridgeAdapter} = await get('BridgeAdapter');

	await deploy('WethTransformer', {
		from: deployer,
		log: true,
		args: [WFUSE_ADDRESS],
		autoMine: true,
	});

	await deploy('PayTakerTransformer', {
		from: deployer,
		log: true,
		autoMine: true,
	});

	await deploy('AffiliateFeeTransformer', {
		from: deployer,
		log: true,
		autoMine: true,
	});

	await deploy('FillQuoteTransformer', {
		from: deployer,
		log: true,
		args: [bridgeAdapter, zeroExAddress],
		autoMine: true,
	});

	await deploy('PositiveSlippageFeeTransformer', {
		from: deployer,
		log: true,
		autoMine: true,
	});
};
export default func;
func.tags = ['Transformers'];
func.dependencies = ['ZeroExMigrated', 'BridgeAdapter'];
