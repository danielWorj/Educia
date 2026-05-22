import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ressource } from '../../Model/MarketPlace/Ressource';
import { HttpClient } from '@angular/common/http';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { TypeRessource } from '../../Model/MarketPlace/TypeRessource';
import { Support } from '../../Model/MarketPlace/Support';

@Injectable({
  providedIn: 'root',
})
export class MarketPlaceService {
  constructor(private http: HttpClient) {}

  // Example method to fetch marketplace items
  findMarketplaceItems():Observable<Support[]> {
    return this.http.get<Support[]>(edulearnDashboard.MarketPlace.Support.all);
  }

  findMarketplaceItemById(id:number):Observable<Support> {
    return this.http.get<Support>(edulearnDashboard.MarketPlace.Support.findbyid+id);
  }
  createMarketplaceItem(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.MarketPlace.Support.create, request);
  }

  updateMarketplaceItem(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.MarketPlace.Support.create, request);
  }

  deleteMarketplaceItem(id:number): Observable<ResponseServer> {
    return this.http.get<ResponseServer>(edulearnDashboard.MarketPlace.Support.delete+id);
  }

  findMarketplaceItemByEnseignantId(id:number):Observable<Support[]> {
    return this.http.get<Support[]>(edulearnDashboard.MarketPlace.Support.allbyEnseignant+id);
  }



  //ressource
  findAllTypeRessource():Observable<TypeRessource[]> {
    return this.http.get<TypeRessource[]>(edulearnDashboard.MarketPlace.allType);
  }

 
  
}
