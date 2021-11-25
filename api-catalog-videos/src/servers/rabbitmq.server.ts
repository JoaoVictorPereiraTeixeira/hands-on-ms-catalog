import {Context} from '@loopback/context';
import {Server} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AmqpConnectionManagerOptions} from 'amqp-connection-manager';
import {Channel, connect, Connection, Options, Replies} from 'amqplib';
import {Category} from '../models';
import {CategoryRepository} from '../repositories';

export interface RabbitmqConfig {
  uri: string
  connOptions?: AmqpConnectionManagerOptions
  exchanges?:{name: string, type: string, options?: Options.AssertExchange}[]
}

export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  conn: Connection;
  channel: Channel;

  constructor(@repository(CategoryRepository) private categoryRepo: CategoryRepository) {
    super();
  }


  async start(): Promise<void> {
    console.log("Setup OK - bora codar!")
  }

  async boot() {
   //TODO
  }

 

  async stop(): Promise<void> {
    await this.conn.close();
    this._listening = false;
  }

  get listening(): boolean {
    return this._listening;
  }
}
