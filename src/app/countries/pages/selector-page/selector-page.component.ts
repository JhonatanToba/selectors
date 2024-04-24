import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { filter, switchMap, tap } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public countriesForm: FormGroup = this.fb.group({
    region : [ '', Validators.required ],
    country: [ '', Validators.required ],
    border : [ '', Validators.required ],
  });

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  public onRegionChanged(): void{

    this.countriesForm.get('region')!.valueChanges
      .pipe(
        tap( () => this.countriesForm.get('country')!.setValue('') ),
        tap( () => this.borders = [] ),
        switchMap( (region) => this.countriesService.getCountriesByRegion( region))
      )
      .subscribe( countries => {
        this.countriesByRegion = countries
      });

  }

  public onCountryChanged(): void {

    this.countriesForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.countriesForm.get('border')!.setValue('') ),
        filter( ( value: string ) => value.length > 0 ),
        switchMap( ( alphaCode ) => this.countriesService.getCountryByAlphaCode( alphaCode ) ),
        switchMap( country => this.countriesService.getCountriesBordersByCodes( country.borders ) )
      )
      .subscribe( countries => {
        this.borders = countries
      });
  }
}
