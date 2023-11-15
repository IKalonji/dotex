import { v4 as uuid } from 'uuid';

class Loan {
    uuid: string = '';
    owner: string = '';
    ownerAddress: string = '';
    approverAddress: string = '';

    requestedAmount: number = 0;
    loanedAmount: number = 0;
    paidAmount: number = 0;
    repaymentAmount: number = 0;
    interestAmount: number = 0;

    active: boolean = false;
    approved: boolean = false;
    rejected: boolean = false;
    fulfilled: boolean = false;
    repaid: boolean = false;
    
    documents: any[] = [];
    bids: Bid[] = [];

    constructor(owner: string = 'Owner', ownerAddress: string = '', approverAddress: string = '',
        requestedAmount: number = 0, documents: any[] = []) {
        this.uuid = uuid();
        this.owner = owner ? owner : 'Owner';
        this.ownerAddress = ownerAddress;
        this.approverAddress = approverAddress;
        this.requestedAmount = requestedAmount;
        this.documents = documents;
        this.active = true;
    }

    calculate() {
        this.bids.forEach(bid => {
            this.loanedAmount += bid.accepted ? bid.bidAmount : 0;
            this.paidAmount += bid.accepted ? bid.paidAmount : 0;
            this.repaymentAmount += bid.accepted ? bid.repaymentAmount : 0;
        });
    }
}

class Bid {
    uuid: string = '';
    ownerAddress: string = '';

    interestRate: number = 0;
    bidAmount: number = 0;
    interestAmount: number = 0;
    repaymentAmount: number = 0;
    paidAmount: number = 0;

    accepted: boolean = false;
    rejected: boolean = false;
    active: boolean = false;
    repaid: boolean = false;

    constructor(ownerAddress: string = "", bidAmount: number = 0, interestRate: number = 0) {
        this.uuid = uuid();
        this.ownerAddress = ownerAddress;
        this.bidAmount = bidAmount;
        this.interestRate = interestRate;
        this.active = true;
        this.calculate();
    }

    calculate() {
        this.interestAmount = this.bidAmount * this.interestRate / 100;
        this.repaymentAmount = this.bidAmount + this.interestAmount;
    }

    accept() {
        this.accepted = true;
        this.rejected = false;
        this.active = true;
        this.calculate();
    }

    reject() {
        this.accepted = false;
        this.rejected = true;
        this.active = false;
    }

    repay(amount: number) {
        this.paidAmount += amount;
        if(this.paidAmount >= this.repaymentAmount) {
            this.repaid = true;
            this.active = false;
        }
    }
}

class Contract {
    loans: Loan[] = [];

    getLoans(): Loan[] {
        return this.loans;
    }

    requestLoan(uuid:string, owner: string, ownerAddress: string, approverAddress: string, amount: number, documents: any[]) {
        const loan = new Loan(owner, ownerAddress, approverAddress, amount, documents);
        loan.uuid = uuid;
        this.loans.push(loan);
    }

    approveLoan(uuidLoan: string, approverAddress: string) {
        const loanIndex = this.loans.findIndex(loan => loan.uuid == uuidLoan);
        if(!this.indexExists(loanIndex)) return;

        if(this.loans[loanIndex].approverAddress != approverAddress) return;
        
        this.loans[loanIndex].approved = true;
    }

    bid(uuidLoan: string, ownerAddress: string, amount: number, interest: number) {
        const loanIndex = this.loans.findIndex(loan => loan.uuid == uuidLoan);
        if(!this.indexExists(loanIndex)) return;

        const bid = new Bid(ownerAddress, amount, interest);
        this.loans[loanIndex].bids.push(bid);
    }

    acceptBid(uuidLoan: string, uuidBid: string) {
        const loanIndex = this.loans.findIndex(loan => loan.uuid == uuidLoan);
        if(!this.indexExists(loanIndex)) return;

        const bidIndex = this.loans[loanIndex].bids.findIndex(bid => bid.uuid == uuidBid);
        if(!this.indexExists(bidIndex)) return;

        this.loans[loanIndex].bids[bidIndex].accepted = true;
    }

    rejectBid(uuidLoan: string, uuidBid: string) {
        const loanIndex = this.loans.findIndex(loan => loan.uuid == uuidLoan);
        if(!this.indexExists(loanIndex)) return;

        const bidIndex = this.loans[loanIndex].bids.findIndex(bid => bid.uuid == uuidBid);
        if(!this.indexExists(bidIndex)) return;

        this.loans[loanIndex].bids[bidIndex].rejected = true;
        this.loans[loanIndex].bids[bidIndex].active = false;
    }

    repayBid(uuidLoan: string, uuidBid: string, amount: number) {
        const loanIndex = this.loans.findIndex(loan => loan.uuid == uuidLoan);
        if(!this.indexExists(loanIndex)) return;

        const bidIndex = this.loans[loanIndex].bids.findIndex(bid => bid.uuid == uuidBid);
        if(!this.indexExists(bidIndex)) return;

        this.loans[loanIndex].bids[bidIndex].paidAmount += amount;
    }

    sendFunds(senderAddress: string, receiverAddress: string, amount: number) {

    }

    indexExists(index: number) {
        return index > -1;
    }
}

export {
    Loan, Bid
}