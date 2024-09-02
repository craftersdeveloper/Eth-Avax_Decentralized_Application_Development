import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [ownerError, setOwnerError] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
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
    fetchFiles(atmContract);
    getBalance(); // Fetch balance on contract initialization
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

  const transferOwnership = async () => {
    if (atm && newOwner) {
      try {
        const tx = await atm.transferOwnership(newOwner);
        await tx.wait();
        alert(`Ownership transferred to ${newOwner}`);
        setNewOwner("");
        checkOwnership(); // Refresh ownership status
      } catch (error) {
        setOwnerError(true);
        setTimeout(() => {
          setOwnerError(false);
        }, 5000);
      }
    }
  };

  const fetchFiles = async (contract) => {
    try {
      const fileArray = await contract.getFiles();
      setFiles(fileArray.map(file => ({
        ...file,
        name: file.name,
        size: file.size.toString() // Convert BigNumber to string for display
      })));
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const addFile = async () => {
    if (atm && fileName && fileSize) {
      try {
        const tx = await atm.addFile(fileName, parseInt(fileSize, 10));
        await tx.wait();
        alert(`File ${fileName} added successfully!`);
        fetchFiles(atm); // Refresh file list after adding
        setFileName("");
        setFileSize("");
      } catch (error) {
        console.error("Error adding file:", error);
      }
    }
  };

  const removeFile = async (index) => {
    if (atm) {
      try {
        const tx = await atm.removeFile(index);
        await tx.wait();
        alert("File removed successfully!");
        fetchFiles(atm); // Refresh file list after removing
      } catch (error) {
        console.error("Error removing file:", error);
      }
    }
  };

  const deposit = async () => {
    if (atm && depositAmount) {
      try {
        const tx = await atm.deposit(ethers.utils.parseEther(depositAmount));
        await tx.wait();
        alert("Deposit successful!");
        setDepositAmount("");
        getBalance(); // Refresh balance after deposit
      } catch (error) {
        console.error("Error depositing funds:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount) {
      try {
        const tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        alert("Withdrawal successful!");
        setWithdrawAmount("");
        getBalance(); // Refresh balance after withdrawal
      } catch (error) {
        console.error("Error withdrawing funds:", error);
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

    return (
      <div>
        <p>Account Address: {account}</p>
        <button onClick={transferOwnership} className="btn-action">Change Owner</button>
        <input
          type="text"
          placeholder="New owner address"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
          className="input-text"
        />
        {ownerError && <p className="error">Error: Unable to change the Owner</p>}
        <div className="section">
          <h3>Deposit</h3>
          <input
            type="number"
            placeholder="Amount in ETH"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={deposit} className="btn-action">Deposit</button>
        </div>

        <div className="section">
          <h3>Withdraw</h3>
          <input
            type="number"
            placeholder="Amount in ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="input-text"
          />
          <button onClick={withdraw} className="btn-action">Withdraw</button>
        </div>

        <div className="section">
          <h3>File Management</h3>
          <input
            type="text"
            placeholder="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="input-text"
          />
          <input
            type="number"
            placeholder="File Size"
            value={fileSize}
            onChange={(e) => setFileSize(e.target.value)}
            className="input-text"
          />
          <button onClick={addFile} className="btn-action">Add File</button>

          <h4>Your Files</h4>
          {files.length > 0 ? (
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  {file.name} ({file.size} bytes)
                  <button onClick={() => removeFile(index)} className="btn-remove">Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafter File Manage Dapp!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #e0e5ec, #ffffff);
          animation: backgroundAnimation 10s ease infinite;
        }

        header {
          text-align: center;
          margin-bottom: 20px;
          animation: headerEntrance 1s ease-out;
        }

        h1 {
          font-size: 2.5rem;
          color: #333;
        }

        /* Button Styles */
        .btn-connect,
        .btn-action,
        .btn-remove {
          background-color: #007bff;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          margin: 5px;
          transition: background-color 0.3s;
        }

        .btn-connect:hover,
        .btn-action:hover,
        .btn-remove:hover {
          background-color: #0056b3;
        }

        .btn-remove {
          background-color: #dc3545;
        }

        .btn-remove:hover {
          background-color: #c82333;
        }

        /* Input Styles */
        .input-text {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 8px;
          font-size: 1rem;
          margin: 5px;
          width: 200px;
          box-sizing: border-box;
        }

        /* Section Styles */
        .section {
          margin: 20px;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
        }

        .section h3 {
          margin-top: 0;
          color: #333;
        }

        .section h4 {
          margin-top: 0;
          color: #555;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        li:last-child {
          border-bottom: none;
        }

        .error {
          color: #dc3545;
          font-size: 1rem;
        }

        @keyframes headerEntrance {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes backgroundAnimation {
          0% {
            background: linear-gradient(135deg, #e0e5ec, #ffffff);
          }
          100% {
            background: linear-gradient(135deg, #ffffff, #e0e5ec);
          }
        }
      `}</style>
    </main>
  );
}
