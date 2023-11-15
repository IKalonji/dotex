// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

pragma abicoder v2;

contract Dotex {

    uint256 numberOfLoans;

    struct Bid{
        string uuid;
        address bidder;
        uint256 bidAmount;
        uint256 rate;
        bool accepted;
        bool rejected;
        bool repaid;
    }

    struct Loan{
        string owner;
        string uuid;
        address requestor; // person requesting funds
        address approver; // entity that has signed the order/invoice
        bool verifiedByApprover;
        uint256 loanAmount;
        string fileCID;
        Bid[] Bids; 
    }

    mapping(uint256 => Loan) public loansCreated;
    Loan[] loansCreatedList;

    constructor()payable{}

    function createLoan(
        string memory _owner,
        address _approver,
        uint256 _amount,
        string memory _cids,
        string memory _loanUUID
    )external payable returns(bool){
        Loan storage newLoan = loansCreated[numberOfLoans];
        newLoan.owner = _owner;
        newLoan.approver = _approver;
        newLoan.loanAmount = _amount;
        newLoan.requestor = msg.sender;
        newLoan.fileCID = _cids;
        newLoan.uuid = _loanUUID;
        loansCreatedList.push(newLoan);
        numberOfLoans++;
        return true;
    }

    function getAllLoans()
        public 
        view 
        returns(Loan[] memory){
        return loansCreatedList;    
    }

    function createBid(
        string memory _uuid,
        string memory _bidId,
        uint256 _amount,
        uint256 _rate   
    )external payable returns(bool){

        for(uint256 i = 0; i <= numberOfLoans; i++){
            if(keccak256(abi.encodePacked(loansCreated[i].uuid)) == keccak256(abi.encodePacked(_uuid))){
                require(msg.value >= _amount, "Insufficient Amount");
                loansCreated[i].Bids.push(Bid(_bidId, msg.sender, _amount, _rate, false, false, false));
                loansCreatedList[i] = loansCreated[i];
                return true;
            }
        }
        return false;
    }

    function acceptBid(
        string memory _loanUUID,
        string memory _bidUUID
    )external returns(bool){
        for(uint256 i = 0; i <= numberOfLoans; i++){
            if(keccak256(abi.encodePacked(loansCreated[i].uuid)) == keccak256(abi.encodePacked(_loanUUID))){
                for(uint256 x = 0; x <= loansCreated[i].Bids.length; x++){
                    if(keccak256(abi.encodePacked(loansCreated[i].Bids[x].uuid)) == keccak256(abi.encodePacked(_bidUUID))){
                        loansCreated[i].Bids[x].accepted = true;
                        sendMoney(loansCreated[i].requestor, loansCreated[i].Bids[x].bidAmount);
                        loansCreatedList[i] = loansCreated[i];
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function rejecttBid(
        string memory _loanUUID,
        string memory _bidUUID
    )external returns(bool){
        for(uint256 i = 0; i <= numberOfLoans; i++){
            if(keccak256(abi.encodePacked(loansCreated[i].uuid)) == keccak256(abi.encodePacked(_loanUUID))){
                for(uint256 x = 0; x <= loansCreated[i].Bids.length; x++){
                    if(keccak256(abi.encodePacked(loansCreated[i].Bids[x].uuid)) == keccak256(abi.encodePacked(_bidUUID))){
                        require(loansCreated[i].Bids[x].rejected == false);
                        loansCreated[i].Bids[x].rejected = true;
                        sendMoney(loansCreated[i].Bids[x].bidder, loansCreated[i].Bids[x].bidAmount);
                        loansCreatedList[i] = loansCreated[i];
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function sendMoney(address to, uint value) internal {
        address payable receiver = payable(to);
        receiver.transfer(value);
    }

    function verifyEntity(string memory _loanUUID)external returns(bool){
        for(uint256 i = 0; i <= numberOfLoans; i++){
            if(keccak256(abi.encodePacked(loansCreated[i].uuid)) == keccak256(abi.encodePacked(_loanUUID))){
                loansCreated[i].verifiedByApprover = true;
                loansCreatedList[i] = loansCreated[i];
                return true;
            }
        }
        return false;
    }

    function repayLoan(
        string memory _loanUUID,
        string memory _bidUUID
    )external payable returns(bool){
        for(uint256 i = 0; i <= numberOfLoans; i++){
            if(keccak256(abi.encodePacked(loansCreated[i].uuid)) == keccak256(abi.encodePacked(_loanUUID))){
                for(uint256 x = 0; x <= loansCreated[i].Bids.length; x++){
                    if(keccak256(abi.encodePacked(loansCreated[i].Bids[x].uuid)) == keccak256(abi.encodePacked(_bidUUID))){
                        require(loansCreated[i].Bids[x].accepted == true, "Not accepted");
                        require(msg.value >= (loansCreated[i].Bids[x].bidAmount + loansCreated[i].Bids[x].rate), "Insuffienct payment");
                        loansCreated[i].Bids[x].repaid = true;
                        sendMoney(loansCreated[i].requestor, loansCreated[i].Bids[x].bidAmount);
                        loansCreatedList[i] = loansCreated[i];
                        return true;
                    }
                }
            }
        }
        return false;
    }

}