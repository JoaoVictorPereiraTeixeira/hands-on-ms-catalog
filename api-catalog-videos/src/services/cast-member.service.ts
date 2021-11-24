import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Message} from 'amqplib';
import {CastMemberRepository} from '../repositories';
import {BaseModelSyncService} from './base-model-sync-service';

@injectable({scope: BindingScope.SINGLETON})
export class CastMemberService  {
  constructor(@repository(CastMemberRepository) private repo: CastMemberRepository) {}
  //TODO
}
