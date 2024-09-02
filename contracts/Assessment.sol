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
