## [1.14.2](https://github.com/andrewinci/insulator2/compare/v1.14.1...v1.14.2) (2022-10-26)

### Bug Fixes

- resolve avro ref to enums ([e8eb9ab](https://github.com/andrewinci/insulator2/commit/e8eb9ab0432430eff54f1a44b885148f8c4bde11))

## [1.14.1](https://github.com/andrewinci/insulator2/compare/v1.14.0...v1.14.1) (2022-10-26)

### Bug Fixes

- disable refresh/reset offset buttons while loading ([156e794](https://github.com/andrewinci/insulator2/commit/156e794f864b1b724f6ffb770924a944725ab1d4))
- only get latest offset for consumer group topics ([e16f361](https://github.com/andrewinci/insulator2/commit/e16f3619b8d928e0b6b06ff9fd7d42b6d62e7a33))

### Performance Improvements

- cache list of all topics/partitions ([6b99732](https://github.com/andrewinci/insulator2/commit/6b99732291d594bb520ce7cc8c199a35092d29a0))
- move get consumer state to another API call ([a4f8999](https://github.com/andrewinci/insulator2/commit/a4f899957482565cb925a6547e55a4d0b55a59e7))

# [1.14.0](https://github.com/andrewinci/insulator2/compare/v1.13.0...v1.14.0) (2022-10-24)

### Features

- Show consumer group lag by topic ([3cf424b](https://github.com/andrewinci/insulator2/commit/3cf424b33e74fe98129717b8c72e32cfd0bd2143))
- Use accordion to group consumer data by topic name ([90ebda7](https://github.com/andrewinci/insulator2/commit/90ebda7000b804d60f061c3aa5b36fa9bf037f6c))

# [1.13.0](https://github.com/andrewinci/insulator2/compare/v1.12.0...v1.13.0) (2022-10-23)

### Bug Fixes

- **FE:** disable refetch in consumer group page ([8eda18f](https://github.com/andrewinci/insulator2/commit/8eda18f39b771dbca8d415ad424752c103fb35ef))

### Features

- Add reset offset in consumer group ([2a3d4b7](https://github.com/andrewinci/insulator2/commit/2a3d4b7421b3ab762e05be225c0f24525129bc88))
- **BE:** Add create consumer group function ([447b09c](https://github.com/andrewinci/insulator2/commit/447b09cdc2befb3d765edff66583f0b45c317471))
- **BE:** Show schema id ([10befc6](https://github.com/andrewinci/insulator2/commit/10befc6729eb3815f8a72769b20f190aa44d74ce))
- **FE:** Add create consumer group modal window ([544ea81](https://github.com/andrewinci/insulator2/commit/544ea8162a622a5f19d9ec73210f584492049345))
- **FE:** Add page subtitles with mock data ([d7bc953](https://github.com/andrewinci/insulator2/commit/d7bc953b1bdff16b637f57c1c908a6b6ef097760))
- Show cleanup policy in the topic page ([cb7203c](https://github.com/andrewinci/insulator2/commit/cb7203cf9ae4e1318cc638412e57de0fa15a3424))
- Show estimated number of records ([e9e0853](https://github.com/andrewinci/insulator2/commit/e9e0853ee979c545c6f7aa0a71d56d4c175f5afc))
- Show number of partitions in topic view ([fad38da](https://github.com/andrewinci/insulator2/commit/fad38da0d2d5489300654ce97dfa7f583dc02541))
- Show schema compatibility level ([3214136](https://github.com/andrewinci/insulator2/commit/3214136b36ae6042dd763c02ec38eca30738e926))

# [1.12.0](https://github.com/andrewinci/insulator2/compare/v1.11.0...v1.12.0) (2022-10-20)

### Bug Fixes

- **BE:** Use committed_offsets speed up query offsets ([f7be070](https://github.com/andrewinci/insulator2/commit/f7be0706503864bcddaf21c2ab3d9736bf3945bb))
- **FE:** overlapping start and text in item list ([2eb6a08](https://github.com/andrewinci/insulator2/commit/2eb6a08315a4b06804228c74a742999b2d1bb9bd))
- **FE:** Scroll list of offsets in consumer groups ([9c9f120](https://github.com/andrewinci/insulator2/commit/9c9f12085ecb771297bd82f8ec5d4ba2710af8ff))

### Features

- **BE:** cache consumer groups ([55bad17](https://github.com/andrewinci/insulator2/commit/55bad17dd34326c4d2b2c808fe75e2d471cd73b3))
- **BE:** retrieve consumer group status ([4c26eea](https://github.com/andrewinci/insulator2/commit/4c26eea77d237717e8f5649b3a4add0c9b021733))

# [1.11.0](https://github.com/andrewinci/insulator2/compare/v1.10.0...v1.11.0) (2022-10-17)

### Features

- Cache topic list ([303f45c](https://github.com/andrewinci/insulator2/commit/303f45c3584be8289218f25f04da42129073dd3f))
- Show topic/partition/offset registered in a cosumer group ([3f626b3](https://github.com/andrewinci/insulator2/commit/3f626b3ccf7b5711a8f80f938284afaab8cd6725))

# [1.10.0](https://github.com/andrewinci/insulator2/compare/v1.9.0...v1.10.0) (2022-10-16)

### Bug Fixes

- compile on windows ([15d0bb6](https://github.com/andrewinci/insulator2/commit/15d0bb601952f825f3e12a8362650c023208771d))
- **FE:** Persist recent items across page change ([00764e9](https://github.com/andrewinci/insulator2/commit/00764e9512b82184fd25ef91ca822aadd6eb60c6))

### Features

- **FE:** Add clear cache button ([856d205](https://github.com/andrewinci/insulator2/commit/856d2052332118c7082b4e0fbbd8ae59c9b24149))
- **FE:** Add favorites to item list ([9679171](https://github.com/andrewinci/insulator2/commit/9679171a9020d505cee90d28c53438028ad6468e))
- Show list of consumer groups ([59a1bff](https://github.com/andrewinci/insulator2/commit/59a1bff91af23393ce551ba598307bec4e7d9549))

# [1.9.0](https://github.com/andrewinci/insulator2/compare/v1.8.1...v1.9.0) (2022-10-14)

### Bug Fixes

- **BE:** Resolve avro references ([367ad94](https://github.com/andrewinci/insulator2/commit/367ad943a1819580849f224f19d95991530b8b29))
- **BE:** Stop consumer on error ([36f8033](https://github.com/andrewinci/insulator2/commit/36f80330cdb360f95de8f9922c39ae94636056a4))
- **FE:** Fix flickering while consuming ([3db919f](https://github.com/andrewinci/insulator2/commit/3db919fa3123af53f74e7b06e3a296d44c936254))

### Features

- create topic ([09a94f4](https://github.com/andrewinci/insulator2/commit/09a94f44eaa2a05e03827e909fa1532f4ff490a5))
- **FE:** Show number of schemas and topics ([59032e2](https://github.com/andrewinci/insulator2/commit/59032e2987581f6fd93ec2332fb23bae3fc14866))
- **FE:** Show recent items in topics and schemas ([024180f](https://github.com/andrewinci/insulator2/commit/024180fe82fef4bdfd41cd825a15028826efc65c))

## [1.8.1](https://github.com/andrewinci/insulator2/compare/v1.8.0...v1.8.1) (2022-10-12)

### Bug Fixes

- **BE:** Use scale to parse avro decimals ([22c8ae8](https://github.com/andrewinci/insulator2/commit/22c8ae8a61fd2cd699315aeb47326ae8abd8235a))

# [1.8.0](https://github.com/andrewinci/insulator2/compare/v1.7.0...v1.8.0) (2022-10-12)

### Features

- parse avro fields ([1af8f8e](https://github.com/andrewinci/insulator2/commit/1af8f8ea0fb1061b5dec9a1d811994229029eecb))

# [1.7.0](https://github.com/andrewinci/insulator2/compare/v1.6.0...v1.7.0) (2022-10-11)

### Bug Fixes

- **BE:** Use a map topic consumer for each cluster ([0c8da4a](https://github.com/andrewinci/insulator2/commit/0c8da4a7a205d2aba45e97751e24b144db95a254))
- **FE:** Use UTC in consumer setting ([1329aff](https://github.com/andrewinci/insulator2/commit/1329aff926e787982de8e24c368f113fbc75c7df))

### Features

- **BE:** re-implement the consumer ([a117ae0](https://github.com/andrewinci/insulator2/commit/a117ae019dc7c00aa674915d2fa91ca81490549c))
- **BE:** Retrieve schema using the id from the kafka record ([3c724b5](https://github.com/andrewinci/insulator2/commit/3c724b5a625b84df924a3b7bb7d454062f5eb38f))
- cache schemas by subject name ([1428c57](https://github.com/andrewinci/insulator2/commit/1428c57985605b4d203d9153a41ed6ae2da839eb))
- **FE:** Save pem in config instead of using locations ([dd62156](https://github.com/andrewinci/insulator2/commit/dd62156084924bd2d9832b64e4e0780701848772))
- **FE:** show error notifications ([a7e40ad](https://github.com/andrewinci/insulator2/commit/a7e40adf045ea744254cb2cc7837ca5dd348b285))
- use avro by default and fallback on string on failure ([9603e2d](https://github.com/andrewinci/insulator2/commit/9603e2d1367f777fc006ed008be02863509750d3))
- use consumer get record from lib ([a11343f](https://github.com/andrewinci/insulator2/commit/a11343f08f2e3cc9b518ab8cd706c53e18138594))
- use consumer stop from lib ([1c8a68c](https://github.com/andrewinci/insulator2/commit/1c8a68c7a2b2c4db53b5bd8ff32807d64803417a))
- Use lib to start consumer and get state ([0fd64c7](https://github.com/andrewinci/insulator2/commit/0fd64c760d42d8277b05daee65463f179fecc8c0))
- use new lib for read/write configurations ([8f7ad00](https://github.com/andrewinci/insulator2/commit/8f7ad00a4dfa60f919594ac4e5221b322a97e2f0))
- use new lib for schema registry ([cd5580c](https://github.com/andrewinci/insulator2/commit/cd5580cdabd563ee140765922fca2bf1f33e1c8e))
- use new lib for the topic list ([d6d348c](https://github.com/andrewinci/insulator2/commit/d6d348c1e77380124b4ca70d2af0465bbfda806d))
- use only one schema registry for each cluster ([00d2631](https://github.com/andrewinci/insulator2/commit/00d263177ad84b7e5eadebe7652d7636af69c123))

# [1.6.0](https://github.com/andrewinci/insulator2/compare/v1.5.0...v1.6.0) (2022-10-03)

### Bug Fixes

- **FE:** Null record in records-table ([113e9bd](https://github.com/andrewinci/insulator2/commit/113e9bd5889934b153d9a11d39a13db382ddcbaf))

### Features

- Add consumer settings ([5ff9431](https://github.com/andrewinci/insulator2/commit/5ff94315caf6106581bf397e10e8366ae5d60ee2))
- **BE:** allow to start consuming from different points ([dac0dbd](https://github.com/andrewinci/insulator2/commit/dac0dbdf3e4fd3b2dce26bd2c6eff16ea41b9499))
- Consumer filter by date time ([b301467](https://github.com/andrewinci/insulator2/commit/b30146752874470cfcb0d0f55d752f84bfa840d3))
- **FE:** Wrap long lines in shema view ([6651878](https://github.com/andrewinci/insulator2/commit/66518785915a8f71afb04bc1cfe7d6c4096841eb))

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
