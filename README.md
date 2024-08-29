## Introduction To Decentralized Application 

This project consists of a smart contract named `Assessment` written in Solidity and a frontend interface built using React.js. The smart contract allows users to manage funds by depositing, withdrawing, and locking tokens. The contract also includes ownership transfer functionality.

## Smart Contract

### Contract: `Assessment`

The `Assessment` contract allows for the following operations:

- **Deposit:** The owner can deposit funds into the contract.
- **Withdraw:** The owner can withdraw funds from the contract.
- **Lock Tokens:** Users can lock a specific amount of tokens within the contract.
- **Unlock Tokens:** Users can unlock previously locked tokens.
- **Ownership Transfer:** The contract owner can transfer ownership to another address.

### Contract Explanation

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Assessment {

    address payable public owner;
    uint256 public balance;
    
    mapping(address => uint256) public lockedTokens;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TokensLocked(address indexed to, uint256 amount);
    event TokensUnlocked(address indexed to, uint256 amount);

    constructor(uint256 initBalance) {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        require(msg.sender == owner, "not owner of this contract");
        balance += _amount;
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "not owner of this contract");
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({balance: balance, withdrawAmount: _withdrawAmount});
        }
        balance -= _withdrawAmount;
        emit Withdraw(_withdrawAmount);
    }

    function isOwner(address _address) public view returns (bool) {
        return _address == owner;
    }

    function transferOwnership(address payable _newOwner) public {
    
        require(msg.sender == owner, "not owner of this contract");
        require(_newOwner != address(0), "Invalid new owner address");
        address payable _previousOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(_previousOwner, _newOwner);
    }

    function lockTokens(uint256 _amount) public {
        require(balance >= _amount, "Payment Failed (Due To Low Balance)");
        lockedTokens[msg.sender] += _amount;
        balance -= _amount;
        emit TokensLocked(msg.sender, _amount);
    }

    function unlockTokens(uint256 _amount) public {
        require(lockedTokens[msg.sender] >= _amount, "Payment Failed (Due To Low Balance)");
        lockedTokens[msg.sender] -= _amount;
        balance += _amount;
        emit TokensUnlocked(msg.sender, _amount);
    }
}
```

- **Owner:** The address that deployed the contract is initially set as the owner.
- **Balance:** The total amount of funds stored in the contract.
- **Locked Tokens:** A mapping that tracks the amount of tokens locked by each address.

**Contract Events**

- **Deposit:** Emitted when funds are deposited.
- **Withdraw:** Emitted when funds are withdrawn.
- **OwnershipTransferred:** Emitted when ownership is transferred.
- **TokensLocked:** Emitted when tokens are locked.
- **TokensUnlocked:** Emitted when tokens are unlocked.

**Contract Functions**

- `getBalance()`: Returns the contract's current balance.
- `deposit(uint256 _amount)`: Allows the owner to deposit `_amount` of funds into the contract.
- `withdraw(uint256 _withdrawAmount)`: Allows the owner to withdraw `_withdrawAmount` of funds.
- `isOwner(address _address)`: Checks if the provided address is the owner of the contract.
- `transferOwnership(address payable _newOwner)`: Transfers ownership to `_newOwner`.
- `lockTokens(uint256 _amount)`: Allows a user to lock `_amount` of tokens.
- `unlockTokens(uint256 _amount)`: Allows a user to unlock `_amount` of tokens.

**Error Handling**

- **InsufficientBalance:** Raised when a withdrawal is attempted with insufficient funds.

## Frontend Interface

The frontend interface is built with React.js and interacts with the `Assessment` smart contract using the `ethers.js` library.

### Features

- **Connect Wallet:** Allows users to connect their Ethereum wallet (e.g., MetaMask).
- **Display Balance:** Shows the current balance of the contract.
- **Ownership Management:** Allows the owner to transfer ownership to another address.
- **Deposit Funds:** Allows the owner to deposit 1 ETH into the contract.
- **Withdraw Funds:** Allows the owner to withdraw 1 ETH from the contract.
- **Lock Tokens:** Allows users to lock a specified amount of tokens.
- **Unlock Tokens:** Allows users to unlock previously locked tokens.

### Usage

1. **Connect Wallet:**
   - Connect your Ethereum wallet using the "Connect" button.
   
2. **Deposit Funds:**
   - Deposit 1 ETH to the contract using the "Deposit" button.

3. **Withdraw Funds:**
   - Withdraw 1 ETH from the contract using the "Withdraw" button.

4. **Transfer Ownership:**
   - Enter the new owner's address and click "Change Owner" to transfer ownership.

5. **Lock Tokens:**
   - Enter the amount of tokens to lock and click "Secure Tokens."

6. **Unlock Tokens:**
   - Enter the amount of tokens to unlock and click "Release Token."


## Setup and Deployment

### Prerequisites

- **Node.js**: Ensure that you have Node.js installed.
- **MetaMask**: Install the MetaMask extension in your browser.

### Installations

1. Clone the repository and navigate to the frontend directory.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Update the `contractAddress` variable in the frontend code with your deployed contract's address.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `localhost` to interact with the application.
