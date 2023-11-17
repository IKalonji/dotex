import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ConfirmationService]
})
export class HomeComponent implements OnInit{

  constructor(private confirmationService: ConfirmationService){}

  ngOnInit(): void {
    this.confirm();
  }

  confirm(){
    this.confirmationService.confirm({
      header: "Usage Notice",
      icon: 'pi pi-exclamation-triangle',
      message: `<pre>This demo is developed on Algorand A1 Devenet (Milkomeda Rollup).
To for the app to function, the following is required:

1. Metamask Installed (<a href="https://metamask.io/download/" target="_blank">Install here</a>)
2. Add Milkomeda Algorand Devnet Metamask networks (<a href="https://docs.milkomeda.com/algorand/for-end-users/configuring-metamask" target="_blank">Add network</a>)
3. Bridge Algorand testnet tokens to Algorand A1 Devnet (<a href="https://docs.milkomeda.com/algorand/for-end-users/wrapping-assets" target="_blank">Bridge tokens</a>)<pre>`,
      rejectVisible: false,
      acceptLabel: "I Understand",
      accept: ()=>{}
    })
  }
}
