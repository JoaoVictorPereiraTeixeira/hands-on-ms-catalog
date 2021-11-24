import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Message} from 'amqplib';
import {GenreRepository} from '../repositories';
import {BaseModelSyncService} from './base-model-sync-service';

@injectable({scope: BindingScope.SINGLETON})
export class GenreSyncService  {
  constructor(@repository(GenreRepository) private repo: GenreRepository) {}

  //TODO
}
