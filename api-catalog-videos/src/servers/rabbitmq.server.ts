import {Binding, Context, inject, MetadataInspector} from '@loopback/context';
import {Application, CoreBindings, Server} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AmqpConnectionManager, AmqpConnectionManagerOptions, ChannelWrapper, connect} from 'amqp-connection-manager';
import {Channel, ConfirmChannel, Message, Options} from 'amqplib';
import {RabbitmqSubscribeMetadata, RABBITMQ_SUBSCRIBE_DECORATOR} from '../decorators/rabbitmq-subscribe.decorator';
import {RabbitmqBindings} from '../keys';
import {Category} from '../models';
import {CategoryRepository} from '../repositories';

export enum ResponseEnum{
  ACK = 0,
  REQUEUE = 1,
  NACK = 2
}

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
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: Application,
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
    @inject(RabbitmqBindings.CONFIG) private config: RabbitmqConfig
  ) {
    super(app);
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
    await this.bindSubscribers();
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


      /*
      [
        {
          method : function(){},
          metadata: {}
        },
        {
          method : function(){},
          metadata: {}
        },
        {
          method : function(){},
          metadata: {}
        }
      ]
    */
  private async bindSubscribers(){
    this
      .getSubscribers()
      .map(
        async (item: any) => {
          await this.channelManager.addSetup(async (channel: ConfirmChannel) => {
            const {exchange, queue, routingKey, queueOptions} = item.metadata;
            const assertQueue = await channel.assertQueue(
              queue ?? '',
              queueOptions ?? undefined
            )

            const routingKeys = Array.isArray(routingKey) ? routingKey : [routingKey];

            await Promise.all(
              routingKeys.map(x => channel.bindQueue(assertQueue.queue, exchange, x))
            );

            await this.consume({
              channel,
              queue: assertQueue.queue,
              method: item.method
            })
          })
        }
      )
  }

  // {method: Function, metadata: RabbitmqSubscribeMetadata}[]
  private getSubscribers() {
    const bindings: Array<Readonly<Binding>> = this.find('services.*');
    // console.log(bindings)
    return bindings.map(
      binding => {
        // console.log(binding)
        const metadata = MetadataInspector.getAllMethodMetadata<RabbitmqSubscribeMetadata>(
          RABBITMQ_SUBSCRIBE_DECORATOR, binding.valueConstructor?.prototype
        )

        if(!metadata){
          return []
        }

        const methods = [] ;

        for(const methodName in metadata){
          const service = this.getSync(binding.key) as any;

          methods.push({
            method: service[methodName].bind(service),
            metadata: metadata[methodName]
          })
        }

          // console.log(".............. binding")
          // console.log(binding)

          // console.log(".............. metadata")
          // console.log(metadata)

          // console.log(".............. methods")
          // console.log(methods)

        return methods;
      }
    ).reduce((collection: any, item: any) => {
      collection.push(...item)
      return collection;
    }, [])


  }

  private async consume({channel, queue, method}: {channel: ConfirmChannel, queue: string, method: Function}){
    await channel.consume(queue, async message => {
      if(!message){
        throw new Error('Received null message');
      }

      const content = message.content;
      if(content){
        let data;
        try{
          data = JSON.parse(content.toString())
        }catch(e){
          data = null
        }

        const responseType = await method({data, message, channel});
        this.dispatchResponse(channel, message, responseType);
      }
    })
  }

  private dispatchResponse(channel: Channel, message: Message, responseType?: ResponseEnum){
    switch(responseType){
      case ResponseEnum.REQUEUE:
        channel.nack(message, false, true)
        break;
      case ResponseEnum.NACK:
        channel.nack(message,false,false)
        break;
      case ResponseEnum.ACK:
      default: true
        channel.ack(message)
    }
  }


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
