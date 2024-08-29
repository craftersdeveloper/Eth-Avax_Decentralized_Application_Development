import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [ownerError, setOwnerError] = useState(false);
  const [ownershipStatus, setOwnershipStatus] = useState(false);
  const [lockAmount, setLockAmount] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const contractAddress = "Contract_Address";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      getWallet();
    } else {
      console.log("Please install MetaMask!");
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (ethWallet && account) {
      getATMContract();
    }
  }, [ethWallet, account]);

  const getWallet = async () => {
    if (ethWallet) {
      try {
        const accounts = await ethWallet.request({ method: "eth_accounts" });
        handleAccount(accounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balanceBigNumber = await atm.getBalance();
        setBalance(ethers.utils.formatEther(balanceBigNumber));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const checkOwnership = async () => {
    if (atm && account) {
      try {
        const isOwner = await atm.isOwner(account);
        setOwnershipStatus(isOwner);
      } catch (error) {
        console.error("Error checking ownership:", error);
      }
    }
  };

  const transferOwnership = async () => {
    if (atm && newOwner) {
      try {
        const tx = await atm.transferOwnership(newOwner);
        await tx.wait();
        alert(`Ownership transferred to ${newOwner}`);
        setNewOwner("");
      } catch (error) {
        setOwnerError(true);
        setTimeout(() => {
          setOwnerError(false);
        }, 5000);
      }
    }
  };

  const lockTokens = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseUnits(lockAmount, 18); 
        const tx = await atm.lockTokens(amountInWei);
        await tx.wait();
        alert(`Locked ${lockAmount} tokens`);
        getBalance(); 
      } catch (error) {
        console.error("Error locking tokens:", error);
      }
    }
  };

  const unlockTokens = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseUnits(lockAmount, 18); 
        const tx = await atm.unlockTokens(amountInWei);
        await tx.wait();
        alert(`Unlocked ${lockAmount} tokens`);
        getBalance(); 
      } catch (error) {
        console.error("Error unlocking tokens:", error);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseEther("1");
        const tx = await atm.deposit(amountInWei, { value: amountInWei });
        await tx.wait();
        alert(`Deposited 1 ETH`);
        getBalance();
        setDepositAmount("");
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        const amountInWei = ethers.utils.parseEther("1");
        const tx = await atm.withdraw(amountInWei);
        await tx.wait();
        alert(`Withdrew 1 ETH`);
        getBalance(); 
        setWithdrawAmount("");
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      console.log("Please connect to MetaMask.");
    } else {
      setAccount(accounts[0]);
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this Dapp.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount} className="btn-connect">Please connect your wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    checkOwnership();

    return (
      <div>
        <p>Account Address: {account}</p>
        <button
          onClick={() => {
            transferOwnership();
          }}
          className="btn-action"
        >
          Change Owner
        </button>
        <input
          type="text"
          placeholder="New owner address"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          className="input-text"
        />
        {ownerError && <p className="error">Error: Unable to change the Owner</p>}
        {ownershipStatus ? (
          <p>Owner of the contract.</p>
        ) : (
          <p>Not Owner of the contract.</p>
        )}
        <button onClick={checkOwnership} className="btn-action">Check Ownership</button>

        <div className="section">
          <h3>Deposit</h3>
          <button onClick={deposit} className="btn-action">Deposit 1 ETH</button>
        </div>

        <div className="section">
          <h3>Withdraw</h3>
          <button onClick={withdraw} className="btn-action">Withdraw 1 ETH</button>
        </div>

        <div className="section">
          <h3>Lock Tokens</h3>
          <input
            type="text"
            placeholder="Amount to lock"
            value={lockAmount}
            onChange={(e) => setLockAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={lockTokens} className="btn-action">Secure Tokens</button>
        </div>

        <div className="section">
          <h3>Unlock Tokens</h3>
          <input
            type="text"
            placeholder="Amount to unlock"
            value={lockAmount}
            onChange={(e) => setLockAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={unlockTokens} className="btn-action">Release Token</button>
        </div>
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Module 2 Dapp Development!</h1>
      </header>
      {initUser()}
      <style jsx>{`
  /* Global Styles */
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: #f0f2f5;
    color: #333;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #e0e5ec, #ffffff);
    position: relative;
    animation: backgroundAnimation 15s infinite alternate;
  }

  /* Header Styles */
  header {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
    animation: headerEntrance 1s ease-out;
  }

  header h1 {
    font-size: 2.5rem;
    margin: 0;
    color: #333;
    font-weight: 700;
  }

  nav {
    margin-top: 20px;
  }

  nav a {
    color: #6200ea;
    text-decoration: none;
    font-weight: 500;
    margin: 0 15px;
    transition: color 0.3s ease;
  }

  nav a:hover {
    color: #3700b3;
  }

  /* Footer Styles */
  footer {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 -6px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    margin-top: 40px;
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 1;
  }

  footer p {
    margin: 0;
    color: #333;
    font-size: 0.875rem;
  }

  /* Error Message Styles */
  .error {
    color: #d32f2f;
    font-weight: 500;
    margin-top: 10px;
    font-size: 0.875rem;
    text-align: center;
  }

  /* Button Styles */
  .btn-connect, .btn-action {
    position: relative;
    background-color: #6200ea;
    color: #ffffff;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 10px;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-transform: uppercase;
    overflow: hidden;
  }

  .btn-connect:hover, .btn-action:hover {
    background-color: #3700b3;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .btn-action:focus, .btn-connect:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(98, 0, 234, 0.3);
  }

  .btn-connect::after, .btn-action::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    width: 300%;
    height: 300%;
    left: -50%;
    top: -50%;
    transition: width 0.6s ease, height 0.6s ease, opacity 0.6s ease;
    opacity: 0;
  }

  .btn-connect:active::after, .btn-action:active::after {
    width: 100%;
    height: 100%;
    opacity: 1;
    transition: 0s;
  }

  /* Input Field Styles */
  .input-text {
    padding: 12px;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    width: 100%;
    max-width: 320px;
    font-size: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
    background-color: #ffffff;
  }

  .input-text:focus {
    border-color: #6200ea;
    box-shadow: 0 0 0 3px rgba(98, 0, 234, 0.3);
    transform: scale(1.02);
    outline: none;
  }

  /* Section Styles */
  .section {
    margin: 20px 0;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    text-align: left;
    opacity: 0;
    transform: translateY(20px);
    animation: sectionFadeIn 1s ease-out forwards;
  }

  .section:hover {
    background-color: #f9f9f9;
  }

  .section h3 {
    margin-top: 0;
    color: #333;
    font-size: 1.75rem;
    font-weight: 600;
    border-bottom: 2px solid #e0e5ec;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  /* Animations */
  @keyframes backgroundAnimation {
    0% { background: linear-gradient(135deg, #e0e5ec, #ffffff); }
    50% { background: linear-gradient(135deg, #ffffff, #e0e5ec); }
    100% { background: linear-gradient(135deg, #e0e5ec, #ffffff); }
  }

  @keyframes headerEntrance {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes sectionFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    header h1 {
      font-size: 2rem;
    }

    .btn-connect, .btn-action {
      padding: 10px 20px;
      font-size: 0.875rem;
    }

    .input-text {
      max-width: 100%;
    }

    .section {
      padding: 15px;
    }

    .section h3 {
      font-size: 1.5rem;
    }
  }
`}</style>    
    </main>
  );
}