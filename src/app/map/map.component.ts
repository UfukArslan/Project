import { Component, OnInit, Input } from "@angular/core";
import { defaultIcon } from "./default-marker";
import { DataTransferMarkerCoordService } from "../api/services/data-transfer-marker-coord.service";
import * as L from "leaflet";
import { ListTripsResponse } from '../models/list-trips-response';
import { DataTransferTripIdMarkerService } from '../api/services/data-transfer-tripId-marker.service';
import { ListPlacesMarkerService } from '../api/services/list-places-marker.service';




@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @Input() dataTransferTripId: any;
  @Input() mapMarkers: L.Marker[] = [];
  @Input() listPlaces:any;

  centerPlace: [];
  name = 'Angular';
  map: L.Map;
  reservationArr : Array<object> = [];
  dataTransferTripIdMarker: ListTripsResponse;

  constructor(
    private dataTransferMarkerCoord: DataTransferMarkerCoordService,  
    private dataTransferTripIdMarkerService: DataTransferTripIdMarkerService, 
    private listPlacesMarkerService: ListPlacesMarkerService,
    ){}
    
    ngOnInit () {
      this.dataTransferTripIdMarker = this.dataTransferTripIdMarkerService.getData();
      console.log("mapComponent/input", this.dataTransferTripId)
      this.listPlacesMarkerService.loadListPlaces(this.dataTransferTripId.id).subscribe({
      next: (coords) => { this.centerPlace = coords[1], 
                              console.log(this.mapMarkers), 
                              coords.forEach ( coord => this.mapMarkers.push(L.marker(coord, { icon: defaultIcon })))}
    });   
  }

  options = { layers: [
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
                        { maxZoom: 18, attribution: '...' })
                      ],
                      zoom: 7.6,
                      center: L.latLng(46.818932, 8.179)
            };

  // loadlistplaces------------------------------------------------------------
  loadlistplaces(){
    this.listPlacesMarkerService.loadListPlaces(this.dataTransferTripId.id).subscribe({
      next: (coords) => { this.centerPlace = coords[1], 
                              console.log(this.mapMarkers), 
                              coords.forEach ( coord => this.mapMarkers.push(L.marker(coord, { icon: defaultIcon })))}
                              
                            });   
                            
  }

  // deletedMarker------------------------------------------------------------    
  deleteMarker(id: string){

    this.listPlacesMarkerService.loadListPlaces(id).subscribe({
      next: (listPlaces) => { this.drawnItems.clearLayers();
                              console.log(this.drawnItems), 
                              listPlaces.forEach ( listPlaces => this.mapMarkers.push(L.marker(listPlaces, { icon: defaultIcon })))},
      error: (err) => { alert(`ERROR`)},     
    });  
                             

  }

  // deletedsearchMarker-----------------------------------------------------             
    deleteSearchMarker(){

      this.drawnItems.clearLayers();                    
    }

  // addmarker---------------------------------------------------------------
  addMarker(f){
    const marker = L.marker(f[0].location.coordinates, { icon: defaultIcon }).bindTooltip(f[0].name);
    marker.addTo(this.map);
    }

  // Display map -------------------------------------------------------------
  onMapReady(map: L.Map): void {
    this.map = map;
    
  setTimeout(() => {
      map.invalidateSize();
    });
  }
  
  // Toolbar----------------------------------------------------------------  
  drawnItems: L.FeatureGroup = L.featureGroup();

  drawOptions = {

    position: 'topleft',
	  draw: {
		  marker: {
			  icon: defaultIcon
		  },
		  polyline: false,
		  circle: {
			  shapeOptions: {
				  color: '#d4af37'
			  }
		  },
		  rectangle: {
			  shapeOptions: {
				  color: '#85bb65'
			  }
		  }
    },
    
    edit: {
      featureGroup: this.drawnItems
    }
    
  };
  
  public onDrawCreated(coord: any) {
    this.drawnItems.addLayer((coord as L.DrawEvents.Created).layer);
    this.dataTransferMarkerCoord.changeMessage([coord.layer._latlng.lat, coord.layer._latlng.lng] );
  }
}

