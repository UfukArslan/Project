import { Component, OnInit } from '@angular/core';
import { AuthService } from '../security/auth.service';
import { DataTransferTripIdService } from '../api/services/data-transfer-tripId.service';
import { DataTransferMarkerCoordService } from "../api/services/data-transfer-marker-coord.service";
import { Router } from '@angular/router';
import { ListTripsResponse } from '../models/list-trips-response';
import { CreatePlaceRequest } from '../models/create-place-request';
import { CreatePlaceService } from '../api/services/create-place.service';
import { ListPlacesService } from 'src/app/api/services/list-places.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ListPlacesResponse } from '../models/list-places-response';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { SearchPlaceService } from 'src/app/api/services/search-place.service';
import { SearchPlaceRequest } from '../models/search-place-request';
import { map, startWith } from 'rxjs/operators';







@Component({
  selector: 'app-places-map',
  templateUrl: './places-map.component.html',
  styleUrls: ['./places-map.component.scss']
})
export class PlacesMapComponent implements OnInit {
  opened: boolean;
  coord: any;
  dataTransferTripId: any;
  listPlaces: ListPlacesResponse[];
  createPlaceRequest: CreatePlaceRequest;
  createPlaceRequestError: boolean;
  // FormStepper 
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
   // Filter 
   myControl = new FormControl();
  //voir listePlaces
   filteredListPlaces: Observable<ListPlacesResponse[]>
   searchPlace: SearchPlaceRequest;

 

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private dataTransferTripIdService: DataTransferTripIdService, 
    private dataTransferMarkerCoordService: DataTransferMarkerCoordService, 
    private createP: CreatePlaceService,
    private _formBuilder: FormBuilder,
    private listPlacesService: ListPlacesService,
    private searchPlaceService: SearchPlaceService
    ){
    this.createPlaceRequest = new CreatePlaceRequest();
    this.createPlaceRequestError = false;
    this.dataTransferTripId = this.dataTransferTripIdService.getData(); // Get tripId for get request of the ListPlaces------------------------------
    this.createPlaceRequest.tripId = this.dataTransferTripId.id;  // Fill informations for postPlace()------------------------------
    this.createPlaceRequest.tripHref= this.dataTransferTripId.href;
    // this.createPlaceRequest.name= this.dataTransferTripId.name;
    // this.createPlaceRequest.description= this.dataTransferTripId.description;
    // this.createPlaceRequest.location.coordinates = this.dataTransferTripId.location.coordinates;
    // this.createPlaceRequest.location.coordinates = this.coord;
  }
  
  ngOnInit(): void {
    // Between placeComponent and template cardComponent------------------------------
    // Form ---------------------------------------------------------------------------
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
    
    this.dataTransferMarkerCoordService.currentMessage.subscribe(coord => this.coord = coord);

    // this.dataTransferTripId = this.dataTransferTripIdService.getData();
    // console.log("place-map/dataTransferTripID",this.dataTransferTripId.href);

    this.listPlacesService.loadListPlaces(this.dataTransferTripId.id).subscribe({
      next: (listPlaces) => { this.listPlaces = listPlaces; 
                              console.log("Subscribe/listPlaces", this.listPlaces);
                              this.filteredListPlaces = this.myControl.valueChanges.pipe(
                                                                                          startWith(''),
                                                                                          map(value => this._filter(value))
                                                                                         )},
    });

  }

  _filter (value: any) : any[] {
    const filterValue = value.toLowerCase();
    return this.listPlaces.filter(listPlace => listPlace.name.toLowerCase().includes(filterValue));
  }
 
  retrievePlace() {
    this.searchPlaceService.searchPlace(this.myControl.value, this.dataTransferTripId.id).subscribe({
      next: (listPlace) =>  this.listPlaces = listPlace, 
      error: (err) => { alert(`Authentication failed: ${err.message}`);
      },
    });
  }

  displayFn(subject: any){
    return subject ? subject.title : undefined;
  }

  console(){
    console.log("placesMap listPlace", this.listPlaces);
    console.log("placesMap dataTransferTrip", this.dataTransferTripId);
    console.log("placesMap creatPlaceRequest", this.createPlaceRequest);
  }
  

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl("/login");
  }


  addCoord(){
    this.createPlaceRequest.location.coordinates = this.coord;
  }


  postPlace(){
    this.createP.createdPlace(this.createPlaceRequest).subscribe({
      next: () => this.router.navigateByUrl("/trips"),
      error: (err) => {
        this.createPlaceRequestError = true;
        console.warn (`Anthentication failed: ${err.message}`);
      },
  })}

  

}
