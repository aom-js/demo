# aom.js / demo

Демо-репозиторий функционала на `aom`.

Данный код представляет собой комплекс сервисов, обеспечивающих запуск кода на `typescript`,
описанного в каталоге `./src`, docker-контейнеров, перечисленных в файле `docker-compose.yml`.

Программный код представляет собой пример `REST`-сервисов, выполняющих действия: авторизация пользователей,
управление справочниками в защищенном API, обращение к файлам и базовые операции над картинками.

Docker-контейнеры поднимают сопутствующее окружение: `MongoDB`, `Zookeeper`+`Kafka`. Пример с контейнерами
показывает возможные аспекты композиции окружения: `nginx`, `Elastic`, `Redis`, `Prerenderer` и так далее. В общем смысле
в production вместо `docker` могут быть использованы уже

Код демонстрирует типовую функциональность, паттерны которой применимы для многих типичных бизнес-задач,
и в общем виде поддерживается документацией [`aom-js/tutorial`](https://github.com/aom-js/tutorial).

Запускаемый код представляет собой типичное программное решение на `aom`: монорепозиторий, способный стартовать
в `development`-окружении, и разбиваться на микросервисы в `production`.

Запуск кода в разработческом окружении осуществляется набором команд

```bash
$ docker-compose up -d
$ yarn
$ yarn start
```

В этом случае запускается файл `scripts/development.ts`, который при необходимости можно развивать дополнительными
возможностями.

Для сборки кода следует выполнить `yarn build`, а затем, в зависимости от окружения, команду `yarn pm2` для запуска
отдельных сервисов в `development` окружении, или `yarn prod` для `production`. Изолированный запуск отдельных служб
происходит за счет `pm2`, который использует данные из конфигурационного файла `ecosystem.config.js`.

Код стабильно стартует на `node@16+` в nix-средах (`Ubuntu`, `MacosX`). **Не тестировался на `Windows`!**

Некоторые каталоги содержат небольшую сопроводительную документацию. Рекомендуется для медитативного изучения
и экспериментов.

Для обращения к поднятым сервисам в `production` используется конфигурационный паттерн `nginx` в 
`/etc/nginx/sites-enabled/*.conf`.

```conf
server {
        server_name chat-api.thegame.bz;
        access_log     /var/log/nginx/chat-api.access.log;
        error_log       /var/log/nginx/chat-api.error.log;

        gzip on;
        gzip_disable "msie6";

        gzip_vary on;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_buffers 16 8k;
        gzip_http_version 1.1;
        gzip_types text/plain text/css application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

        client_max_body_size 5M;
        client_body_buffer_size    128k;

        location / {
            proxy_pass http://127.0.0.1:7900;
            proxy_redirect     off;
            proxy_set_header   Host  $host;
            proxy_intercept_errors on;
            proxy_set_header X-Real-IP $remote_addr;
        }
}

```

Таким образом становится доступно подключение к открытым портам извне.