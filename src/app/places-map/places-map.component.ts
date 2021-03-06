import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../security/auth.service';
import { DataTransferTripIdService } from '../api/services/data-transfer-tripId.service';
import { DataTransferMarkerCoordService } from "../api/services/data-transfer-marker-coord.service";
import { Router } from '@angular/router';
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
import { MapComponent } from '../map/map.component';
import { DataTransferTripIdMarkerService } from '../api/services/data-transfer-tripId-marker.service';



@Component({
  selector: 'app-places-map',
  templateUrl: './places-map.component.html',
  styleUrls: ['./places-map.component.scss']
})
export class PlacesMapComponent implements OnInit {

  @ViewChild (MapComponent) mapComponent:MapComponent;

    mapMarkers: L.Marker[] = [];
    opened: boolean;
    coord: any;
    dataTransferTripId: any;
    listPlaces: any[];
    createPlaceRequest: CreatePlaceRequest;
    createPlaceRequestError: boolean;
    
    // FormStepper ------------------------------------
    isLinear = false;
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    thirdFormGroup: FormGroup;

    // Filter -----------------------------------------
    myControl = new FormControl();

    //Voir listePlaces --------------------------------
    filteredListPlaces: Observable<ListPlacesResponse[]>
    searchPlace: SearchPlaceRequest;
    

  constructor(
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

    // Get tripId for get request of the ListPlaces---------------------------------------------
    this.dataTransferTripId = this.dataTransferTripIdService.getData();

    // Fill informations for postPlace()---------------------------------------------------------
    this.createPlaceRequest.tripId = this.dataTransferTripId.id; 
    this.createPlaceRequest.tripHref= this.dataTransferTripId.href;
  }
  
  ngOnInit(): void {
    // Form validation---------------------------------------------------------------------------
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(14)]]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(14)]]
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required]
    });
    this.dataTransferMarkerCoordService.currentMessage.subscribe(coord => this.coord = coord);

    this.createP.RefreshNeeded$.subscribe(()=>{
                                                  this.loadListPlace();
                                                 });
    this.loadListPlace()

  }

  loadListPlace(){
    this.listPlacesService.loadListPlaces(this.dataTransferTripId.id)
      .subscribe({
        
                    next: (listPlaces: ListPlacesResponse[]) => { this.listPlaces = listPlaces;
                                                                  console.log(this.listPlaces);
                                                                  console.log(this.dataTransferTripId);
                                                                  this.filteredListPlaces = this.myControl.valueChanges
                                                                                              .pipe(
                                                                                                      startWith(''),
                                                                                                      map(value => this._filter(value))
                                                                                                    )
                                                                },
                    error: (err) => { alert(`ERROR`)},  
                                                                  
                  });
  } 

  deletedPlace(){
    this.listPlacesService.loadListPlaces(this.dataTransferTripId.id)
      .subscribe({
        
                    next: (listPlaces: ListPlacesResponse[]) => { this.listPlaces = listPlaces;
                                                                  this.mapMarkers.length = 0;
                                                                  this.mapComponent.deleteMarker(this.dataTransferTripId.id);
                                                                  this.filteredListPlaces = this.myControl.valueChanges
                                                                                              .pipe(
                                                                                                      startWith(''),
                                                                                                      map(value => this._filter(value))
                                                                                                    )
                                                                },
                      error: (err) => { alert(`ERROR`)}, 
                  });
  } 

  _filter (value: any) : any[] {
    const filterValue = value.toLowerCase();
    return this.listPlaces.filter(listPlace => listPlace.name.toLowerCase().includes(filterValue));
  }
 
  retrievePlaces() {
    this.listPlacesService.loadListPlaces(this.dataTransferTripId.id)
    .subscribe({
      
                  next: (listPlaces: ListPlacesResponse[]) => { this.listPlaces = listPlaces,
                                                                this.mapMarkers.length = 0,
                                                                this.mapComponent.deleteSearchMarker(),
                                                                this.mapComponent.loadlistplaces(),
                                                                this.filteredListPlaces = this.myControl.valueChanges
                                                                                            .pipe(
                                                                                                    startWith(''),
                                                                                                    map(value => this._filter(value))
                                                                                                  )
                                                              },
                  error: (err) => { alert(`ERROR`)}, 
                });
  }

  retrievePlace() {
    this.searchPlaceService.searchPlace(this.myControl.value, this.dataTransferTripId.id)
    .subscribe({
                  next: (listPlace) =>  { this.listPlaces = listPlace, 
                                          this.mapMarkers.length = 0,  
                                          this.mapComponent.deleteSearchMarker(),
                                          this.mapComponent.addMarker(this.listPlaces)},
                  error: (err) => { alert(`ERROR`)},
    });
  }

  displayFn(subject: any){
    return subject ? subject.title : undefined;
  }

  console(){
    console.log("placesMap listPlace", this.listPlaces);
    console.log("placesMap dataTransferTrip", this.dataTransferTripId);
    console.log("placesMap creatPlaceRequest", this.createPlaceRequest);
    console.log(this.dataTransferTripIdService.getData());
  }
  
  addCoord(){
    this.createPlaceRequest.location.coordinates = this.coord;
    console.log(this.dataTransferTripId);
    
  }

  postPlace(){
    this.createP.createdPlace(this.createPlaceRequest).subscribe({
      next: () => {this.router.navigateByUrl("/places"), alert("Create place")},
      error: (err) => { alert ("ERROR");
      },
  })}

  
}


