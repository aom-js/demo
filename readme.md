# aom.js / demo

Демо-репозиторий кода на `aom`.

Данный код представляет собой комплекс сервисов, обеспечивающих запуск кода на `typescript`,
описанного в каталоге `./src`, docker-контейнеров, перечисленных в файле `docker-compose.yml`.

Программный код представляет собой пример `REST`-сервисов, выполняющих действия: авторизация пользователей,
управление справочниками в защищенном API, обращение к файлам и базовые операции над картинками.

Docker-контейнеры поднимают сопутствующее окружение: `MongoDB`, `Zookeeper`+`Kafka`, `Redis`.

Запускаемый код представляет собой типичное программное решение на `aom`: монорепозиторий, способный стартовать
в `development`-окружении, и разбиваться на микросервисы.

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

Код стабильно стартует на `node@16+` в nix-средах (`Ubuntu`, `MacosX`). Не тестировался на `Windows`.

Некоторые каталоги содержат небольшую сопроводительную документацию. Рекомендуется для медитативного изучения
и экспериментов.