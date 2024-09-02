## Introduction To Decentralized Application 

This project consists of a smart contract named `Assessment` written in Solidity and a frontend interface built using React.js. The smart contract allows users to manage funds by depositing, withdrawing, and locking tokens. The contract also includes ownership transfer functionality.

## Smart Contract

### Contract Explanation

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Assessment {

    // State Variable

    address payable public owner;
    uint256 public balance;

    // File Info Struct

    struct File {
        string name;
        uint256 size;
    }
    
    mapping(address => File[]) public files;
    
    // events 
    
    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FileAdded(address indexed owner, string name, uint256 size);
    event FileRemoved(address indexed owner, string name);

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

    function transferOwnership(address payable _newOwner) public {
        require(msg.sender == owner, "not owner of this contract");
        require(_newOwner != address(0), "Invalid new owner address");
        address payable _previousOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(_previousOwner, _newOwner);
    }

    // File management functions

    function addFile(string memory _name, uint256 _size) public {
        File memory newFile = File(_name, _size);
        files[msg.sender].push(newFile);
        emit FileAdded(msg.sender, _name, _size);
    }

    function removeFile(uint256 index) public {
        require(index < files[msg.sender].length, "Invalid file index");
        File memory file = files[msg.sender][index];
        for (uint256 i = index; i < files[msg.sender].length - 1; i++) {
            files[msg.sender][i] = files[msg.sender][i + 1];
        }
        files[msg.sender].pop();
        emit FileRemoved(msg.sender, file.name);
    }

    function getFiles() public view returns (File[] memory) {
        return files[msg.sender];
    }
}
```
1. **State Variables**:
   - `owner`: A payable address representing the owner of the contract.
   - `balance`: An unsigned integer representing the contract's balance.

2. **File Struct**:
   - Defines a `File` structure with two properties: `name` (a string representing the file name) and `size` (an unsigned integer representing the file size).

3. **Mappings**:
   - `files`: A mapping that associates each address with an array of `File` structs. This stores files uploaded by different users.

4. **Events**:
   - `Deposit`: Emitted when funds are deposited into the contract.
   - `Withdraw`: Emitted when funds are withdrawn from the contract.
   - `OwnershipTransferred`: Emitted when the ownership of the contract is transferred from the current owner to a new owner.
   - `FileAdded`: Emitted when a file is added by a user.
   - `FileRemoved`: Emitted when a file is removed by a user.

### Constructor

- `constructor(uint256 initBalance)`: Initializes the contract by setting the `owner` to the deployer (`msg.sender`) and setting the initial `balance` to `initBalance`.

### Functions

1. **Balance Management**:
   - `getBalance()`: Returns the current balance of the contract.
   - `deposit(uint256 _amount)`: Allows the owner to deposit a specified `_amount` to the contract. The sender must be the owner; otherwise, the transaction fails.
   - `withdraw(uint256 _withdrawAmount)`: Allows the owner to withdraw a specified `_withdrawAmount` from the contract. If the balance is insufficient, it reverts with an error.

2. **Ownership Management**:
   - `transferOwnership(address payable _newOwner)`: Allows the current owner to transfer ownership to a new address. The new owner's address must not be a zero address.

3. **File Management**:
   - `addFile(string memory _name, uint256 _size)`: Allows any user to add a file to their own file list. The file's name and size are specified, and an event is emitted upon addition.
   - `removeFile(uint256 index)`: Allows a user to remove a file from their file list by specifying its index. The function ensures the index is valid and emits an event upon removal.
   - `getFiles()`: Returns an array of files associated with the caller's address.

### Usage Summary

- The contract manages funds for the owner, allowing them to deposit, withdraw, and transfer ownership.
- It also provides a decentralized file management system where users can add or remove files, and retrieve their file list.
- Events are emitted for key actions, allowing for transparency and easier tracking of changes on the blockchain.
  
### Usage

1. **Connect Wallet:**
   - Connect your Ethereum wallet using the "Connect" button.
   
2. **Deposit Funds:**
   - Deposit 1 ETH to the contract using the "Deposit" button.

3. **Withdraw Funds:**
   - Withdraw 1 ETH from the contract using the "Withdraw" button.

4. **Transfer Ownership:**
   - Enter the new owner's address and click "Change Owner" to transfer ownership.

5. **File Upload:**
   - Enter the file name & size and click "add file"

6. **Remove Uploaded File:**
   - click "Remove File"


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
