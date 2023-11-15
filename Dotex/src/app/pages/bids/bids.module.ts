import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BidsRoutingModule } from './bids-routing.module';
import { RequestComponent } from './request/request.component';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { BidsComponent } from './bids.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpClientModule } from '@angular/common/http';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';


@NgModule({
  declarations: [
    RequestComponent,
    BidsComponent
  ],
  imports: [
    CommonModule,
    BidsRoutingModule,
    ButtonModule,
    MenubarModule,
    InputTextModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextareaModule,
    FileUploadModule,
    HttpClientModule,
    OverlayPanelModule,
    TableModule,
    AccordionModule,
    PanelModule,
    TabViewModule
  ]
})
export class BidsModule { }
