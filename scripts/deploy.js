const hre = require("hardhat");

async function main() {
  const initBalance = 1; // Initial balance example, modify as needed
  const Assessment = await hre.ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy(initBalance); // Deploy with initial balance
  
  await assessment.deployed();
  console.log(`Contract deployed to address: ${assessment.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
