import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ressource } from '../../Model/MarketPlace/Ressource';
import { HttpClient } from '@angular/common/http';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { TypeRessource } from '../../Model/MarketPlace/TypeRessource';

@Injectable({
  providedIn: 'root',
})
export class MarketPlaceService {
  constructor(private http: HttpClient) {}

  // Example method to fetch marketplace items
  findMarketplaceItems():Observable<Ressource[]> {
    return this.http.get<Ressource[]>(edulearnDashboard.MarketPlace.all);
  }

  createMarketplaceItem(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.MarketPlace.create, request);
  }

  updateMarketplaceItem(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.MarketPlace.create, request);
  }

  findAllTypeRessource():Observable<TypeRessource[]> {
    return this.http.get<TypeRessource[]>(edulearnDashboard.MarketPlace.allType);
  }
}
