# Hands-on



## Requisitos ##

* Docker instalado


### WINDOWS - Instruções setup de ambiente ###

1) Acessar projeto rabbitmq e executar o seguinte comando:
```
docker-compose up -d
```

2) É necessário adequar o arquivo entrypoint.sh para o padrão unix, para isso no projeto api-catalog-videos realize o seguinte comando utilizando o Git Bash
```
dos2unix ./.docker/entrypoint.sh
```

3) Renomear arquivo .env.example para .env

4) Acessar projeto api-catalog-videos e executar o seguinte comando:
```
npm install
docker-compose up -d
```

5) Resultado esperado:
```
Setup OK - bora codar!

Server is running at a http://127.0.0.1:3000

Try http://127.0.0.1:3000/ping
```



### LINUX - Instruções setup de ambiente ###

1) Acessar projeto rabbitmq e executar o seguinte comando:
```
docker-compose up -d
```

2) Renomar arquivo .env.example para .env

3) Acessar projeto api-catalog-videos e executar o seguinte comando:
```
docker-compose up -d
```

4) Resultado esperado:
```
Setup OK - bora codar!

Server is running at a http://127.0.0.1:3000

Try http://127.0.0.1:3000/ping
```

