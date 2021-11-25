import {Context, inject} from '@loopback/context';
import {Server} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AmqpConnectionManager, AmqpConnectionManagerOptions, ChannelWrapper, connect} from 'amqp-connection-manager';
import {Channel, ConfirmChannel, Connection, Options, Replies} from 'amqplib';
import { RabbitmqBindings } from '../keys';
import {Category} from '../models';
import {CategoryRepository} from '../repositories';

export interface RabbitmqConfig {
  uri: string
  connOptions?: AmqpConnectionManagerOptions
  exchanges?:{name: string, type: string, options?: Options.AssertExchange}[]
}

export class RabbitmqServer extends Context implements Server {
  private _listening: boolean;
  private _conn: AmqpConnectionManager;
  private _channelManager: ChannelWrapper

  constructor(
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
    @inject(RabbitmqBindings.CONFIG) private config: RabbitmqConfig
  ) {
    super();
  }

  async start(): Promise<void> {

    this._conn = connect([this.config.uri], this.config.connOptions);
    this._channelManager  = this.conn.createChannel();
    this._channelManager.on('connect', () => {
      this._listening = true
      console.log("Conectado ao RabbitMQ")
    })

    this._channelManager.on('error', (err, {name}) => {
      this._listening = false
      console.log("Falho ao conectador ao RabbitMQ")
    })

    await this.setupExchanges();


    // this.conn = await connect({
    //   hostname: 'rabbitmq',
    //   username: 'admin',
    //   password: 'admin'
    // });
    // this._listening = true;
    // this.boot();
  }

  private async setupExchanges(){
    return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
      if(!this.config.exchanges){
        return;
      }

      await Promise.all(this.config.exchanges.map((exchange) => {
        channel.assertExchange(exchange.name, exchange.type, exchange.options)
      }));

    })
  }

  // async boot() {
  //   this.channel = await this.conn.createChannel();

  //   const queue : Replies.AssertQueue = await this.channel.assertQueue('micro-catalog/sync-videos');
  //   const exchange : Replies.AssertExchange = await this.channel.assertExchange('amq.topic','topic')

  //   await this.channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*')
  //   await this.channel.consume(queue.queue, (message) => {
  //     if(!message){
  //       return;
  //     }
      
  //     const data = JSON.parse(message.content.toString())
  //     const [model, event] = message.fields.routingKey.split('.').splice(1)
  //     this
  //       .sync({model,event,data})
  //       .then(() => this.channel.ack(message))
  //     console.log(model, event)
      
  //   })

  // }

  async sync({model,event, data}: {model: string, event: string, data: Category}){
    if(model === 'category'){
      switch(event){
        case 'created':
          await this.categoryRepo.create({
            ...data,
            created_at: new Date().toString(),
            updated_at: new Date().toString(),
          })
          break;
        default:
          break;
      }
    }
  }

  async stop(): Promise<void> {
    await this.conn.close();
    this._listening = false;
  }

  get conn(): AmqpConnectionManager {
    return this._conn;
  }

  get channelManager(): ChannelWrapper {
    return this._channelManager
  }

  get listening(): boolean {
    return this._listening;
  }
}
