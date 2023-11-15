import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Web3Storage } from 'web3.storage';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  client = new Web3Storage({ token: environment.Web3StorageToken});

  constructor() { }

  async uploadFile(file: any) {
    return await this.client.put(file, {
      name: file.name,
      maxRetries: 3,
    });
  }

  async downloadFile(cid: string) {
    const response = await this.client.get(cid);
    const files = await response?.files();

    if(files) {
      const blob = new Blob(files, { type: files[0].type });
      const url = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = files[0].name;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }
}
