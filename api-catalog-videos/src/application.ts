import {BootMixin} from '@loopback/boot';
import {Application, ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestComponent, RestServer} from '@loopback/rest';
import {RestExplorerBindings} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {RestExplorerComponent} from './components/rest-explorer.component';
import {MySequence} from './sequence';
import {RabbitmqServer} from './servers/index';

export {ApplicationConfig};

export class MicroCatalogApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(Application)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    options.rest.sequence = MySequence;
    this.component(RestComponent);
    const restServer = this.getSync<RestServer>('servers.RestServer');
    restServer.static('/', path.join(__dirname, '../public'));

    //Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.server(RabbitmqServer);
  }

  async boot(){
    await super.boot();

    // const genreRepo = this.getSync('repositories.GenreRepository')
    // console.log("OK executado")
    //@ts-ignore
    // genreRepo.updateCategories({
    //   "id": "1-cat",
    //   "name": "Filme - Alterado",
    //   "is_active": true
    // })

    // const validator = this.getSync<ValidatorService>('services.ValidatorService');
    // try{
    //   validator.validate({
    //     data: {
    //       id: '12'
    //     },
    //     entityClass: Category
    //   })
    // }catch(e){
    //   console.dir(e, {depth: 8})
    // }
  }
}
