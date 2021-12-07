import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {GenreRepository} from '../repositories';

@injectable({scope: BindingScope.SINGLETON})
export class GenreSyncService  {
  constructor(@repository(GenreRepository) private repo: GenreRepository) {}

  //TODO
}
