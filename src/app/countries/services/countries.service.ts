import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private basicUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania ];

  constructor(
    private http: HttpClient
  ) { }


  public get regions() : Region[] {
    return [ ...this._regions ];
  }

  getCountriesByRegion( region: Region ): Observable<SmallCountry[]> {

    if ( !region) {
      return of([]);
    }

    const url : string = `${ this.basicUrl }/region/${ region }?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        })))
      );
  }

  getCountryByAlphaCode( alphaCode: string): Observable<SmallCountry>{

    const url = `${ this.basicUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;

    return this.http.get<Country>(url)
      .pipe(
        map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))
      );
  }

  getCountriesBordersByCodes( borders: string[] ): Observable<SmallCountry[]>{
    if ( !borders || borders.length === 0) {
      return of([]);
    }

    const countriesRequests: Observable<SmallCountry>[]  = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push( request );
    })

    return combineLatest( countriesRequests );
  }
}
