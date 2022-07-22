/*function deployFunc(hre){
    console.log("Hi....")
};

module.exports.default = deployFunc*/
/*module.exports = async (hre) => {
    const{getNamedAccounts,deployments}=hre
    //getting named accounts nad deployments from hre
    //similar to :
    //hre.getNamedAccounts
    //hre.deployments
} */

// more syntactically sugar way of this
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() // getting a deployer account from named accounts
    const chainId = network.config.chainId
    let ethsUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggreagtor = await deployments.get("MockV3Aggregator")
        ethsUsdPriceFeedAddress = ethUsdAggreagtor.address
    } else {
        ethsUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethsUsdPriceFeedAddress]
    const fundme = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundme.address, args)
    }
    log("_________________________________________")
}
module.exports.tags = ["all", "fundme"]