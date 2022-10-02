# [1.5.0](https://github.com/andrewinci/insulator2/compare/v1.4.0...v1.5.0) (2022-10-02)

### Bug Fixes

- **BE:** Delete the handle after stopping the consumer ([b236c16](https://github.com/andrewinci/insulator2/commit/b236c16c9b9b5997ddd1d85cbeb159a461bd5687))
- **FE:** navigation ([82eaaa3](https://github.com/andrewinci/insulator2/commit/82eaaa359cb69396a1c9ff6b88f79d44e4094cf6))

### Features

- **BE:** add get records count api ([12c889c](https://github.com/andrewinci/insulator2/commit/12c889c3f515a9d81b69acdb6569092e3f4f1a98))
- **BE:** add get_consumer_state function and disable tauri notifications ([4c7eb7c](https://github.com/andrewinci/insulator2/commit/4c7eb7cf3da81b0439bf96289ec4a92d40900c2e))
- **BE:** add partitions to topic info ([2ac5ee8](https://github.com/andrewinci/insulator2/commit/2ac5ee81a125c6e9e2440484a726319315480b65))
- **BE:** Add POC API to handle multiple consumers ([b148f33](https://github.com/andrewinci/insulator2/commit/b148f33d2e7440ae1e80443b6173518756607a36))
- **BE:** disable offset autocommit by default ([36f12aa](https://github.com/andrewinci/insulator2/commit/36f12aaa056ef2fcebd03aee4d33b862d2f0b0c1))
- **BE:** return partition info in list_topic api ([be853ea](https://github.com/andrewinci/insulator2/commit/be853ea3499ce6b92d0ec1a31616f0fc26debb77))
- **BE:** Stop consumer and notify client on error in the loop ([8e30455](https://github.com/andrewinci/insulator2/commit/8e30455fc918c01f83854f4e7ac0de89225fd0cf))
- **BE:** Use lossy parsing for utf8 strings ([6ed9325](https://github.com/andrewinci/insulator2/commit/6ed932545adfd1cd9b585c32dd8f1c4ede51e5ee))
- Consume from all partitions ([6a091bf](https://github.com/andrewinci/insulator2/commit/6a091bf85eca1eb54b497b4dd1509a681c354c21))
- **FE:** Consumer view ([81cacee](https://github.com/andrewinci/insulator2/commit/81cacee5edbd52860a081ac12598452e6ecd6208))
- **FE:** Show records as cards ([3aeb70d](https://github.com/andrewinci/insulator2/commit/3aeb70deacdf1b37448b08dcad494f56e904b523))
- **FE:** Use mantine style in the records table ([9a91af2](https://github.com/andrewinci/insulator2/commit/9a91af2e359b84eee824f9d85c7cfd4d09b887f0))
- Show record offset, partition and timestamp ([ca23f8a](https://github.com/andrewinci/insulator2/commit/ca23f8ade99981f7ff980cd352237c9dfc1748c5))

# [1.4.0](https://github.com/andrewinci/insulator2/compare/v1.3.0...v1.4.0) (2022-09-27)

### Bug Fixes

- deal with long schemas and topic names ([86e1d1d](https://github.com/andrewinci/insulator2/commit/86e1d1d77882111a1230da820960db1a6527623c))
- set timeout for schema registry requests ([89add9e](https://github.com/andrewinci/insulator2/commit/89add9e388e878c300e4dc9449f49c0344d5bc79))

### Features

- generate update manifests ([f937c03](https://github.com/andrewinci/insulator2/commit/f937c030038a4de5d84b496265ba8abd3c8dd370))
- New version example ([f7063f7](https://github.com/andrewinci/insulator2/commit/f7063f7ea54b91ee2bdd1720e66bb028bef30ab7))

# [1.3.0](https://github.com/andrewinci/insulator2/compare/v1.2.1...v1.3.0) (2022-09-25)

### Bug Fixes

- **FE:** Hide versions selector while loading ([5300e67](https://github.com/andrewinci/insulator2/commit/5300e67a66f5e787de676882e6b1a0ffe25c0ff8))
- **FE:** Remove line numbers in schema cause they appears when copy pasting ([2f504d9](https://github.com/andrewinci/insulator2/commit/2f504d94fedc8dc273f75f8bfd4c98ce58632451))

### Features

- add setting to disable notifications ([a0b0e0b](https://github.com/andrewinci/insulator2/commit/a0b0e0b61d83b6b6dc2ac89bd5e8ff5c779d15b7))
- **FE:** Show spinner loading the schemas ([48b0fa4](https://github.com/andrewinci/insulator2/commit/48b0fa4d0a84d02cda8dd21ce5fd37a8ccff6438))
- **FE:** Use allotment to split the panes ([ce1f9ed](https://github.com/andrewinci/insulator2/commit/ce1f9edcafe6a749da56804094059b483a0ce90a))

## [1.2.1](https://github.com/andrewinci/insulator2/compare/v1.2.0...v1.2.1) (2022-09-25)

### Bug Fixes

- **FE:** scroll the schema ([e95e013](https://github.com/andrewinci/insulator2/commit/e95e01333b8d92ae9ecc184b40cd74b0daac568e))

# [1.2.0](https://github.com/andrewinci/insulator2/compare/v1.1.0...v1.2.0) (2022-09-25)

### Bug Fixes

- **FE:** padding to avoid scroll bar overlap with content ([7ce0a36](https://github.com/andrewinci/insulator2/commit/7ce0a36b86d5147b18216c792a137803fd5c7162))
- **FE:** warning switching from undefined to string in the search input ([1b711f5](https://github.com/andrewinci/insulator2/commit/1b711f520347b286facf1033cc82fe556a184682))

### Features

- **BE:** Get all schema versions for a given subject ([287a50d](https://github.com/andrewinci/insulator2/commit/287a50db9d3a1d68773f2cd965c0fb6a95c3685a))
- **BE:** Get latest schema for a given subject ([6b026e2](https://github.com/andrewinci/insulator2/commit/6b026e28d747b1036fb035645208e76eb0e677a6))
- **BE:** Get list of schemas ([549102e](https://github.com/andrewinci/insulator2/commit/549102ee08d161dd9b6dfda74680a3c61b19521b))
- **FE:** Add schema registry page ([0d078e5](https://github.com/andrewinci/insulator2/commit/0d078e5a68d59f3d556e9a56b6f7b2a3abffc7e9))
- **FE:** Show schema ([a04e702](https://github.com/andrewinci/insulator2/commit/a04e702326a1fcefac046182aaf05b3bea17a7d2))

# [1.1.0](https://github.com/andrewinci/insulator2/compare/v1.0.1...v1.1.0) (2022-09-24)

### Bug Fixes

- **FE:** Do not change clusters order ([a29366c](https://github.com/andrewinci/insulator2/commit/a29366c7f6b9f97b8721250dc30040150aa8cbd4))

### Features

- **BE:** support SSL ([02e0a58](https://github.com/andrewinci/insulator2/commit/02e0a58c63d8f4ee5ef4631e0e2c3178c66ef76b))
- **FE:** Use scrollable area in cluster form and list ([a110589](https://github.com/andrewinci/insulator2/commit/a1105899d180997395769158213f18e63035cc1a))
- store all configurations ([88eef82](https://github.com/andrewinci/insulator2/commit/88eef82a8994640835ac9a7186391ef62ee52961))

## [1.0.1](https://github.com/andrewinci/insulator2/compare/v1.0.0...v1.0.1) (2022-09-23)

### Bug Fixes

- **BE:** mac os build ([#5](https://github.com/andrewinci/insulator2/issues/5)) ([f9fbd35](https://github.com/andrewinci/insulator2/commit/f9fbd35f06dc5b02b70536b79b850a8fc53463e7))

# 1.0.0 (2022-09-22)

### Bug Fixes

- **FE:** Topic list is always empty ([b982d4f](https://github.com/andrewinci/insulator2/commit/b982d4f4766b2d888eadd99120b226c35f670d10))

### Features

- **BE:** Expose a minimal set of api ([282ac8b](https://github.com/andrewinci/insulator2/commit/282ac8bde6d1c41f872805a451527fb903e04796))
- **BE:** read/write user configurations ([2ce1e07](https://github.com/andrewinci/insulator2/commit/2ce1e070d0a61d2fb033ce6de804d2f3e2d73c78))
- **BE:** support SASL ([1df6dc9](https://github.com/andrewinci/insulator2/commit/1df6dc977eab1209fc8ec1e795cbe98694e26621))
- change window title ([2f99892](https://github.com/andrewinci/insulator2/commit/2f99892de887d3bfdca8f3fdcd0ade6eeab5e0bc))
- **FE:** Add active cluster to the state ([b3d60b7](https://github.com/andrewinci/insulator2/commit/b3d60b7d3c6b87021c2ac4a16a481637a5b896d1))
- **FE:** Add app state provider ([40372f0](https://github.com/andrewinci/insulator2/commit/40372f0c11e04858118e06d2bfd01aebfc9a0368))
- **FE:** Add main page ([b3b7550](https://github.com/andrewinci/insulator2/commit/b3b7550fdd6fff5aea7d25a44c46d5838894aa30))
- **FE:** Add notification component ([4759688](https://github.com/andrewinci/insulator2/commit/4759688b2b30941368710ac9191c926e70b080c2))
- **FE:** add refresh topic list button ([6b1a003](https://github.com/andrewinci/insulator2/commit/6b1a003dd9f6b7098ef5201f136857a805fb1fd0))
- **FE:** Add settings page ([2b305a0](https://github.com/andrewinci/insulator2/commit/2b305a0a9a68feea45717a9fa8c59181e0d125bb))
- **FE:** Add/Edit cluster configs ([73917b1](https://github.com/andrewinci/insulator2/commit/73917b12d038b1ec741cb46f1126e1f79d202227))
- **FE:** complete cluster config form ([b9cbc82](https://github.com/andrewinci/insulator2/commit/b9cbc82381e5bd7abd29a7d705757455ef016d7a))
- **FE:** delete cluster configs ([dbc9327](https://github.com/andrewinci/insulator2/commit/dbc93273cf02cbce01ec58aa95c2d69fff2d34a4))
- **FE:** Remove top bar ([abb1719](https://github.com/andrewinci/insulator2/commit/abb1719fba185f372ded0fb759070a17ab4e7ae7))
- **FE:** Show a notification when config are loaded ([861933d](https://github.com/andrewinci/insulator2/commit/861933d3673d6c7d04f6489121f28616f28b3e66))
- **FE:** show empty topic list warning ([e702f24](https://github.com/andrewinci/insulator2/commit/e702f2495dfb91bdcdde0382a8e70c99d343c660))
- **FE:** show loading on topics list ([446f0e5](https://github.com/andrewinci/insulator2/commit/446f0e5019194db1d8dabadaf1811c1cf0f94c2d))
- **FE:** show topic page ([b32131f](https://github.com/andrewinci/insulator2/commit/b32131fcf9890e54fb7786ea283540e6ccc50353))
- **FE:** sort topic list ([420a503](https://github.com/andrewinci/insulator2/commit/420a503816c904f34323f03c4f2c61c09f252376))
- **FE:** Split App component ([2990b10](https://github.com/andrewinci/insulator2/commit/2990b105173c543377c9080ab757eb8edb6dd2b9))
- show list of topics ([4ac327f](https://github.com/andrewinci/insulator2/commit/4ac327f00a9e8cdee351a6035192468f6d8dcc83))
- Store team in config ([115bb15](https://github.com/andrewinci/insulator2/commit/115bb158c17868d9d5101e06d3aff2440f0528a8))
- Use Id to uniquely identify cluster configs ([61ab8cf](https://github.com/andrewinci/insulator2/commit/61ab8cf77cdcbd97d168e9135ce034a1d19a9200))
