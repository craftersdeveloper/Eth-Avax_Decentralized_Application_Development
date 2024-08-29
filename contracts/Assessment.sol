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
