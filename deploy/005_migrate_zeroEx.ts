import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts, ethers} = hre;
	const {deploy, get} = deployments;
	const {deployer} = await getNamedAccounts();

	const {address: migratorAddress} = await get('FullMigration');
	const migrator = await ethers.getContractAt('FullMigration', migratorAddress);

	const {address: zeroExAddress} = await get('ZeroEx');
	const zeroEx = await ethers.getContractAt('IZeroEx', zeroExAddress);

	const {address: registry} = await get('SimpleFunctionRegistryFeature');
	const {address: ownable} = await get('OwnableFeature');
	const {address: transformERC20} = await get('TransformERC20Feature');
	const {address: metaTransactions} = await get('MetaTransactionsFeature');
	const {address: nativeOrders} = await get('NativeOrdersFeature');
	const {address: otcOrders} = await get('OtcOrdersFeature');

	const migratorOpts = {zeroExAddress, transformerDeployer: deployer};
	const features = {
		registry,
		ownable,
		transformERC20,
		metaTransactions,
		nativeOrders,
		otcOrders,
	};

	const tx = await migrator.migrateZeroEx(deployer, zeroExAddress, features, migratorOpts);

	console.log('Migrated ZeroEx', tx.hash);
	console.log({deployer, zeroExAddress, features, migratorOpts});

	console.log('flashwallet', await zeroEx.getTransformWallet());
};
export default func;
func.tags = ['ZeroExMigrated'];
func.dependencies = ['Features'];
