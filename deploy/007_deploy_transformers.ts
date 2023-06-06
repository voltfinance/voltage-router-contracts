import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const {WFUSE_ADDRESS} = process.env;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts} = hre;
	const {deploy, get} = deployments;
	const {deployer} = await getNamedAccounts();

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

	await deploy('FillQuoteTransformer', {
		from: deployer,
		log: true,
		args: [bridgeAdapter],
		autoMine: true,
	});
};
export default func;
func.tags = ['Transformers'];
func.dependencies = ['RouterMigrated', 'BridgeAdapter'];
