import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Message} from 'amqplib';
import {CategoryRepository} from '../repositories';
import {BaseModelSyncService} from './base-model-sync-service';

@injectable({scope: BindingScope.SINGLETON})
export class CategorySyncService {
  constructor(
    @repository(CategoryRepository) private repo: CategoryRepository
  ) {}

   //TODO
}
