import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts, ethers} = hre;
	const {deploy, get} = deployments;

	const {address: migratorAddress} = await get('FullMigration');
	const migrator = await ethers.getContractAt('FullMigration', migratorAddress);

	const {deployer} = await getNamedAccounts();

	await deploy('Router', {
		from: deployer,
		log: true,
		args: [await migrator.getBootstrapper()],
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
};
export default func;
func.tags = ['Router'];
func.dependencies = ['FullMigration'];
