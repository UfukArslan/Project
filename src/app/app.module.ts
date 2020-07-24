import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { DummyPageComponent } from './dummy-page/dummy-page.component';
import { SecurityModule } from './security/security.module';
import { ApiTokenInterceptorService } from './api/api-token-interceptor.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { FormsModule } from '@angular/forms';
import { CreateTripComponent } from './create-trip/create-trip.component';
import { DialogContentExampleDialog } from './example/dialog-content-example';


@NgModule({
  declarations: [AppComponent, DummyPageComponent, CreateTripComponent, DialogContentExampleDialog],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, SecurityModule, BrowserAnimationsModule, MaterialModule, FormsModule],
  entryComponents: [DialogContentExampleDialog],
  providers: [{
    provide: HTTP_INTERCEPTORS, 
    useClass: ApiTokenInterceptorService,
    multi: true,
    
  },],
  bootstrap: [AppComponent]
})
export class AppModule { }
