import { Injectable } from '@angular/core';
import { Bid, Loan } from 'src/app/models/models';
import { FileService } from '../file/file.service';
import { ethers } from 'ethers';
import { ABI } from '../../contracts/ABI/abi';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  provider: ethers.providers.Web3Provider;
  contract: ethers.Contract;
  loans: Loan[] = [];
  sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  constructor(private fileService: FileService) { 
    // Connect to the MetaMask provider
    this.provider = new ethers.providers.Web3Provider(window.ethereum);

    // Connect to the contract using the ABI
    this.contract = new ethers.Contract(
      '0xB947cdacC4998985106cA278dF2A23875c5a8363',
      ABI,
      this.provider.getSigner()
    );
  }

  async getWalletAddress() {

    const provider = window.ethereum;
    if(!provider){
      alert("Metamask with Algorand A1 is not installed, please install!");
      return;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log(chainId);
    if (chainId != "0x30e0a"){
      alert("You need to be connected to Milkomeda Algorand A1 Devnet to proceed. Please switch networks and reload the app.")
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x30e0a' }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x30e0a',
                  chainName: 'Milkomeda Algorand Devnet',
                  rpcUrls: ['https://rpc-devnet-algorand-rollup.a1.milkomeda.com'],
                  nativeCurrency: {
                    name: 'Milkomeda Testnet Algo',
                    symbol: 'mTALGO', // 2-6 characters long
                    decimals: 18
                  },
                  blockExplorerUrls: ['https://testnet-algorand-rollup.a1.milkomeda.com']
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }
    } else {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'}).catch((err:any) => {
        if (err.code === 4001){
          alert("Metamask not connected");
        }
        alert("Metamask connection error");
      });
      return accounts[0];
    }

    
  }

  async getLoans() {
    this.loans = [];
    const transaction = await this.contract.getAllLoans();
    transaction.forEach((trans: any) => {
      let loan = new Loan();
      loan.owner = trans.owner ? trans.owner : loan.owner;
      loan.active = true;
      loan.approved = trans.verifiedByApprover;
      loan.requestedAmount = Number(trans.loanAmount._hex);
      loan.uuid = trans.uuid;
      loan.ownerAddress = trans.requestor;
      loan.approverAddress = trans.approver;
      loan.documents = this.splitString(trans.fileCID);

      trans.Bids.forEach((transBid: any) => {
        let bid = new Bid();
        bid.accepted = transBid.accepted;
        bid.ownerAddress = transBid.bidder;
        bid.bidAmount = Number(transBid.bidAmount);
        bid.repaid = transBid.repaid;
        bid.uuid = transBid.uuid;
        bid.rejected = transBid.rejected
        bid.interestAmount = Number(transBid.rate);
        bid.repaymentAmount = bid.bidAmount + bid.interestAmount;
        loan.bids.push(bid);
      });
      loan.calculate();
      this.loans.push(loan);
    });

    return this.loans;
  }

  splitString(text: string) {
    if(!text) return [];

    return text.split(",").filter(s => s.length).map(s => {
      return { name: s, cid: s };
    });
  }

  async createLoan(owner: string, ownerAddress: string, approverAddress: string, loanAmount: number, documents: any[]) {
    let file: any = [];
    let docs: any = [];
    let files = "";
    let cidCount = 0;
    let transaction;
    if(documents.length) {
      documents.forEach(async doc => {
        file.push(doc);
        await this.fileService.uploadFile(file).then(async cid => {
          docs.push({ name: file[0].name, cid: cid });
          files += cid + ",";
          file = [];
          cidCount++;
          if(cidCount >= documents.length) {
            transaction = await this.contract.createLoan(owner, approverAddress, loanAmount, files, uuid());
            transaction.wait();
          }
        });
      });
    } else {
      transaction = await this.contract.createLoan(owner, approverAddress, loanAmount, files, uuid());
      transaction.wait();
    }
    return transaction;
  }

  async bid(uuidLoan: string, ownerAddress: string, bidAmount: number, interestRate: number) {
    let interest = Math.ceil(bidAmount * interestRate / 100);
    const transaction = await this.contract.createBid(uuidLoan, uuid(), bidAmount, interest, {value: ethers.utils.parseEther(`${ethers.utils.formatEther(ethers.BigNumber.from(bidAmount))}`)});
    transaction.wait();
    return transaction;
  }

  async approveLoan(uuidLoan: string) {
    const transaction = await this.contract.verifyEntity(uuidLoan);
    transaction.wait();
    return transaction;
  }

  async acceptBid(uuidLoan: string, uuidBid: string) {
    const transaction = await this.contract.acceptBid(uuidLoan, uuidBid);
    transaction.wait();
    return transaction;
  }

  async rejectBid(uuidLoan: string, uuidBid: string) {
    const transaction = this.contract.rejecttBid(uuidLoan, uuidBid);
    return transaction;
  }

  async repayBid(uuidLoan: string, uuidBid: string, amount: number) {
    console.log(amount);
    const transaction = await this.contract.repayLoan(uuidLoan, uuidBid, {value: ethers.utils.parseEther(`${ethers.utils.formatEther(ethers.BigNumber.from(amount))}`)});
    transaction.wait();
    return transaction;
  }

  /*async uploadFiles(documents: any) {
    documents.forEach(async doc => {
      file.push(doc);
      let trans = await this.fileService.uploadFile(file).then(async cid => {
        docs.push({ name: file[0].name, cid: cid });
        files += cid + ",";
        file = [];
      });
    });
  }*/
}
