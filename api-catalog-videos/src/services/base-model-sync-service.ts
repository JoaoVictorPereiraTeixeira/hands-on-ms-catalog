import {DefaultCrudRepository} from '@loopback/repository';
import {Message} from 'amqplib';
import {pick} from 'lodash';

interface SyncOptions {
  repo: DefaultCrudRepository<any, any>;
  data: any;
  message: Message
}

export abstract class BaseModelSyncService {
  //TODO
}
