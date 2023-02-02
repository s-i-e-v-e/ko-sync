# ko-sync

*ko-sync* is a simple sync server for koreader that can be hosted locally. It follows the API specified in the [Koreader Sync Server](https://github.com/koreader/koreader-sync-server) project.

It uses sqlite as the backend.

## Getting started

*ko-sync* requires some kind of Linux distribution. It ought to work under WSL on Windows. With minor alterations to the config directory detection code, it should also work on Windows. 

Steps:

* Install [Deno](https://deno.land/) (`curl -fsSL https://deno.land/x/install/install.sh | sh`)
* Clone this repository
* `cd` into the base directory
* Install *ko-sync* using `deno install --config 'deno.json' --check --allow-all --unstable 'src/ko-sync.ts' "$@"`. Do this every time you update the repository so that the latest changes are compiled.

## Licensing

*ko-sync* is licensed under *GNU AFFERO GENERAL PUBLIC LICENSE, Version 3.0* (AGPL).