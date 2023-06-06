import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts, ethers} = hre;
	const {get} = deployments;
	const {deployer} = await getNamedAccounts();

	const {address: migratorAddress} = await get('FullMigration');
	const migrator = await ethers.getContractAt('FullMigration', migratorAddress);

	const {address: routerAddress} = await get('Router');
	const router = await ethers.getContractAt('IRouter', routerAddress);

	const {address: registry} = await get('SimpleFunctionRegistryFeature');
	const {address: ownable} = await get('OwnableFeature');
	const {address: transformERC20} = await get('TransformERC20Feature');

	const migratorOpts = {transformerDeployer: deployer};
	const features = {
		registry,
		ownable,
		transformERC20,
	};

	const tx = await migrator.migrateRouter(deployer, routerAddress, features, migratorOpts);

	console.log('Migrated Router', tx.hash);
	console.log({deployer, router: routerAddress, features, migratorOpts});

	await tx.wait();
	console.log('Tx Mined at', tx.blockNumber);

	console.log('flashwallet', await router.getTransformWallet());
};
export default func;
func.tags = ['RouterMigrated'];
func.dependencies = ['Features'];
