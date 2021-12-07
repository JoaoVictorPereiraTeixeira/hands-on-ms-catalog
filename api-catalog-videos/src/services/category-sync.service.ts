import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Message} from 'amqplib';
import {rabbitmqSubscribe} from '../decorators/rabbitmq-subscribe.decorator';
import {CategoryRepository} from '../repositories';
import {BaseModelSyncService} from './base-model-sync-service';

@injectable({scope: BindingScope.SINGLETON})
export class CategorySyncService extends BaseModelSyncService {
  constructor(
    @repository(CategoryRepository) private repo: CategoryRepository
  ) {
    super()
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/category',
    routingKey: 'model.category.*'
  })
  async handler({data, message}: {data: any, message: Message}){

  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/category/BANANA',
    routingKey: 'model.category.banana.*'
  })
  async handler2({data, message}: {data: any, message: Message}){

  }
}
