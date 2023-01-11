## [2.9.1](https://github.com/andrewinci/insulator2/compare/v2.9.0...v2.9.1) (2023-01-11)

### Bug Fixes

- make search case insensitive ([899d72c](https://github.com/andrewinci/insulator2/commit/899d72c04e2e42b388c1457d79631c4fdb39e83a))
- mitigate empty code editor ([095fe02](https://github.com/andrewinci/insulator2/commit/095fe02b0f291fe07e6beae35eeaba3854a3952c))
- truncate long titles to avoid overlap with tools button ([ffbd152](https://github.com/andrewinci/insulator2/commit/ffbd152660eaf5d884aa10c714a398ec73068741))

# [2.9.0](https://github.com/andrewinci/insulator2/compare/v2.8.0...v2.9.0) (2023-01-09)

### Bug Fixes

- disable autocomplete in add consumer group ([5ce0280](https://github.com/andrewinci/insulator2/commit/5ce0280f1b01da12d39afa38147adb2da02ed502))
- disable autocomplete/autocapitalize in create topic modal ([0bfa38a](https://github.com/andrewinci/insulator2/commit/0bfa38a2b5b6042809758da12422ca2fe15bde38))
- favourites removed when a cluster is updated ([a67accf](https://github.com/andrewinci/insulator2/commit/a67accf45919cef342da08e113c5f2724018f947))
- remove consumer group from the UI when deleted ([e983727](https://github.com/andrewinci/insulator2/commit/e983727b800e8a9dd8af844c67b6aacf2fae691e))
- remove schema from the UI when deleted ([3134e35](https://github.com/andrewinci/insulator2/commit/3134e3598ca181d65bd8cbd7a1273afd2c614f61))
- remove topic from the UI when deleted ([15c5050](https://github.com/andrewinci/insulator2/commit/15c505080dbd411a912749790a86295a4e60d5cf))
- start consumer loader as soon as the consumer is started ([aa0c9dc](https://github.com/andrewinci/insulator2/commit/aa0c9dc514549f5b150db1ed3e9e344c0e8d7ebe))
- support logical types in avro unions ([1118c9c](https://github.com/andrewinci/insulator2/commit/1118c9c5b16a0c62908f88ae327f86c472fec9d5))
- wrong code theme in new windows ([a9150e0](https://github.com/andrewinci/insulator2/commit/a9150e0af571ed8cd0edce854d0177fdc09dcf69))

### Features

- add avro producer ([#307](https://github.com/andrewinci/insulator2/issues/307)) ([e7bb6a4](https://github.com/andrewinci/insulator2/commit/e7bb6a471219807cd076af25219335791097e9c9))
- add external windonw button to record details modal ([ab80738](https://github.com/andrewinci/insulator2/commit/ab807387b923956d414421e8b7bd2f7413bfab6f))
- add kafka timeout settings ([889f07a](https://github.com/andrewinci/insulator2/commit/889f07afdbb0ca69e0839be818dd248611f77823))
- add shortcut to jump to the schema from the topic ([cb56b58](https://github.com/andrewinci/insulator2/commit/cb56b58c76eb4623f58ae1bce052771298ebe026))
- add string producer ([#300](https://github.com/andrewinci/insulator2/issues/300)) ([bb0ab30](https://github.com/andrewinci/insulator2/commit/bb0ab30526fc9fc4aba7b0c4da2558c8d61a02c5))
- allow user to open the topic and the schema registry to a new window ([151d50d](https://github.com/andrewinci/insulator2/commit/151d50d6ece9f5125df7d5c34e19ab0e51d64c89))

# [2.8.0](https://github.com/andrewinci/insulator2/compare/v2.7.1...v2.8.0) (2022-12-21)

### Bug Fixes

- disable autocomplete on search input ([5ee2e0e](https://github.com/andrewinci/insulator2/commit/5ee2e0ed697eb0ab0377c16ce861e9cb23242cfd))
- minimize button colors ([e754635](https://github.com/andrewinci/insulator2/commit/e754635be8295faaaeff6df3362de0bdaa342a21))

### Features

- consumer shortcuts ([#275](https://github.com/andrewinci/insulator2/issues/275)) ([3ff3041](https://github.com/andrewinci/insulator2/commit/3ff3041d55732a6e0308cf2d62f0a46a14e1f0c0))

## [2.7.1](https://github.com/andrewinci/insulator2/compare/v2.7.0...v2.7.1) (2022-12-19)

### Bug Fixes

- unable to decode nested avro schema without namespace ([ad59f98](https://github.com/andrewinci/insulator2/commit/ad59f98e62a6a9dcf75828bd281252d3ca31d740))

# [2.7.0](https://github.com/andrewinci/insulator2/compare/v2.6.0...v2.7.0) (2022-12-16)

### Bug Fixes

- increase timeout in export records ([a8df9e5](https://github.com/andrewinci/insulator2/commit/a8df9e53fd152472d77aff30bea5b63385dc5a02))
- set default sql timeout to 10s instead of 0 ([1941190](https://github.com/andrewinci/insulator2/commit/1941190a324a53914f2fdf3af913dc6a5fdc6cb5))
- strip protocol from the cluster endpoint ([5c17b2f](https://github.com/andrewinci/insulator2/commit/5c17b2f609b7348b7925cdcb41ee4c90077d23b1))

### Features

- add topic info modal ([9e7b4fa](https://github.com/andrewinci/insulator2/commit/9e7b4faba8737771b401f4ab5eb7ce3620f6bd87))
- Configure SSL connections using truststore and keystore ([#251](https://github.com/andrewinci/insulator2/issues/251)) ([5cf6913](https://github.com/andrewinci/insulator2/commit/5cf6913ee18e27dbe70676b05ce49cc769553a0e))
- download schema locally ([d21bc33](https://github.com/andrewinci/insulator2/commit/d21bc3326b4a70456a9e5246b12e646a7a96f8e4))
- minimize sidebar and item list column ([#254](https://github.com/andrewinci/insulator2/issues/254)) ([46c0cf3](https://github.com/andrewinci/insulator2/commit/46c0cf30c9d7eac5ce64e951b47cdf2c09c46f25))

# [2.6.0](https://github.com/andrewinci/insulator2/compare/v2.5.0...v2.6.0) (2022-12-11)

### Bug Fixes

- resolve schema from cache when no ns is specified ([9d4b727](https://github.com/andrewinci/insulator2/commit/9d4b727005df97ccae59c58a81263d17dde11f79))

### Features

- improve cluster search ([df4e6d8](https://github.com/andrewinci/insulator2/commit/df4e6d8f4c775e2694458e80de9d6bc5cb15ed27))
- make record details modal resizable ([e94e65c](https://github.com/andrewinci/insulator2/commit/e94e65c4a63122d8dc6938d67ea78e6434642e68))
- use resizable modal in add-schema-modal ([d25b146](https://github.com/andrewinci/insulator2/commit/d25b1463d835ba6bfd9672d3d3c22a35e0403000))

### Performance Improvements

- extract nested schemas in schema registry to speed up Avro serde ([208837a](https://github.com/andrewinci/insulator2/commit/208837a20b05b6ef78d5ab3873f0dc3e4fefd5cf))

# [2.5.0](https://github.com/andrewinci/insulator2/compare/v2.4.1...v2.5.0) (2022-12-04)

### Bug Fixes

- repeated keystroke in input fields ([a24ee3e](https://github.com/andrewinci/insulator2/commit/a24ee3e3f31aa3c89726a5d37837dce9c1cb2d57))

### Features

- Allow to set query timeout ([#211](https://github.com/andrewinci/insulator2/issues/211)) ([ff68093](https://github.com/andrewinci/insulator2/commit/ff68093be9d991df0a5b61584c360acefad8084b))
- shrink cluster items ([5def932](https://github.com/andrewinci/insulator2/commit/5def932f3f1fff544fd1c3724b67c8bdf44ca188))

### Performance Improvements

- fetch consumer state after stop and disable re-fetching while the consumer is stopped ([9eaed7a](https://github.com/andrewinci/insulator2/commit/9eaed7a6b138957d78bd4bd40ee1deaa78bf7c41))
- on query only refetch first page ([b52f49b](https://github.com/andrewinci/insulator2/commit/b52f49bbede39948c8eb1e980dd135654340534d))
- use an instert counter instead of a query to get the table size ([8b6af73](https://github.com/andrewinci/insulator2/commit/8b6af730a06948add4b4a207bed55eabb74a2a0d))

## [2.4.1](https://github.com/andrewinci/insulator2/compare/v2.4.0...v2.4.1) (2022-12-02)

### Bug Fixes

- code editor margins ([4df10f7](https://github.com/andrewinci/insulator2/commit/4df10f7d1cf8b3b5b88e2ab22949070d161d28ec))
- shortcuts on mac os ([#201](https://github.com/andrewinci/insulator2/issues/201)) ([a8e19e4](https://github.com/andrewinci/insulator2/commit/a8e19e4122e33dba51a0c0f0459a1e8e36e96623))

# [2.4.0](https://github.com/andrewinci/insulator2/compare/v2.3.1...v2.4.0) (2022-12-01)

### Bug Fixes

- allow upper and lower case in search inputs ([aa0d970](https://github.com/andrewinci/insulator2/commit/aa0d9707e818c7ecbc23e07010a75c14d8f4c541))

### Features

- add option to "compactify" consumed records ([#194](https://github.com/andrewinci/insulator2/issues/194)) ([903641a](https://github.com/andrewinci/insulator2/commit/903641a2d683775667c7264d808121aae81c9baf))
- export internal database ([6a49dae](https://github.com/andrewinci/insulator2/commit/6a49dae9b7f8662ff78555749879dbafe9b797a1))

## [2.3.1](https://github.com/andrewinci/insulator2/compare/v2.3.0...v2.3.1) (2022-11-30)

### Bug Fixes

- store favorites locally ([056e1af](https://github.com/andrewinci/insulator2/commit/056e1afaf87cbbc53019257988dff85569e1bd5e))

# [2.3.0](https://github.com/andrewinci/insulator2/compare/v2.2.0...v2.3.0) (2022-11-28)

### Features

- active users telemetry ([0a36d3a](https://github.com/andrewinci/insulator2/commit/0a36d3a7c806b99c3f97c054d3ba2e641927785b))
- emit errors from the kafka consumer to the frontend ([d20def2](https://github.com/andrewinci/insulator2/commit/d20def2bc402468185d9c3bdf4baed45f6d5fca4))
- pause consumer group when a consumption intervall is specified ([42a5753](https://github.com/andrewinci/insulator2/commit/42a5753e1614aa2273ac43f31de77e56f2612057))

# [2.2.0](https://github.com/andrewinci/insulator2/compare/v2.1.0...v2.2.0) (2022-11-28)

### Bug Fixes

- missing app version in sidebar ([1525533](https://github.com/andrewinci/insulator2/commit/1525533b253b878d2d4eae8094160a494aca8d65))
- show raw error when unable to parse as TauriError ([482c0d7](https://github.com/andrewinci/insulator2/commit/482c0d7a18cf0b52f1b67f7e641c3197207cd973))

### Features

- add modal to view a single record in monaco ([36bf5c2](https://github.com/andrewinci/insulator2/commit/36bf5c26c2f053f115ea7eff43e173d6d9cfcf22))
- allow user to export consumed records ([fcff611](https://github.com/andrewinci/insulator2/commit/fcff611a00be62c64d9743c23084174b9a7fbc6f))
- copy parsed json from the record list ([27d0f47](https://github.com/andrewinci/insulator2/commit/27d0f47a42e3c476665dab0139ea6586c870c927))

# [2.1.0](https://github.com/andrewinci/insulator2/compare/v2.0.1...v2.1.0) (2022-11-24)

### Bug Fixes

- store last view ([ebe1fc5](https://github.com/andrewinci/insulator2/commit/ebe1fc56ab7ec1a0e47b629d268449e963cb26b9))

### Features

- **FE:** add tools to schema registry view via monaco js ([16acd78](https://github.com/andrewinci/insulator2/commit/16acd785440cbf46ca9b54dbcdc1c75b48c0525b))
- **FE:** redesign records view page ([#161](https://github.com/andrewinci/insulator2/issues/161)) ([bb5924b](https://github.com/andrewinci/insulator2/commit/bb5924b41c105ca963a1f58ff5c5947bf80b3314))
- validate json in add schema modal ([48d711e](https://github.com/andrewinci/insulator2/commit/48d711ef61b43fd25a9ca2dd498095345a3e1f65))

## [2.0.1](https://github.com/andrewinci/insulator2/compare/v2.0.0...v2.0.1) (2022-11-20)

### Bug Fixes

- broken icon in mac os ([b6a2c40](https://github.com/andrewinci/insulator2/commit/b6a2c409090c75e3cd3db47a1a373d5d964cc42a))

# [2.0.0](https://github.com/andrewinci/insulator2/compare/v1.18.1...v2.0.0) (2022-11-20)

- feat!: Switch to TOML for config format (again) (#159) ([84a2d10](https://github.com/andrewinci/insulator2/commit/84a2d10224c3cbd46ebd3080b21a6970d247ae25)), closes [#159](https://github.com/andrewinci/insulator2/issues/159)

### Performance Improvements

- Use connection pool to interact with the DB ([#160](https://github.com/andrewinci/insulator2/issues/160)) ([636a025](https://github.com/andrewinci/insulator2/commit/636a025a60096dbb1d3ea667d70cc19c17af9230))

### BREAKING CHANGES

- use toml for configurations instead of json

## [1.18.1](https://github.com/andrewinci/insulator2/compare/v1.18.0...v1.18.1) (2022-11-18)

### Bug Fixes

- dead lock consuming multiple topics ([3c6fb3a](https://github.com/andrewinci/insulator2/commit/3c6fb3a166c29c1ef3dbc2cc7a794d0cb72163ec))

### Performance Improvements

- reduce records page size to 20 ([4b605be](https://github.com/andrewinci/insulator2/commit/4b605beb59f97fe709d41732d913c7b6bf1e861a))

# [1.18.0](https://github.com/andrewinci/insulator2/compare/v1.17.0...v1.18.0) (2022-11-14)

### Bug Fixes

- **fe:** divider misaligned in schema registry ([a30b2ac](https://github.com/andrewinci/insulator2/commit/a30b2ac065795302b8f2ad7e6d4e04b22463ec89))
- **fe:** divider misaligned in the settings page ([e3abf6a](https://github.com/andrewinci/insulator2/commit/e3abf6a114eee67c2a836d3eddb3ec5e201c8d8e))
- **FE:** replace undefined with ... ([f0a8731](https://github.com/andrewinci/insulator2/commit/f0a8731f33e5ebf86d5a8effecd74cb4eb717ae8))
- remove duplidate divider in the consumer group page ([ae6773a](https://github.com/andrewinci/insulator2/commit/ae6773a4bce081d235a7aef4ef31722d0670e7c6))

### Features

- add delete consumer group tool ([7cddb2f](https://github.com/andrewinci/insulator2/commit/7cddb2fe57a10bec52a7762d5cc787b88461a8cb))
- Allow users to create a new schema ([#132](https://github.com/andrewinci/insulator2/issues/132)) ([574169c](https://github.com/andrewinci/insulator2/commit/574169c904ac28917e8f750f3f55c8fb40bb3bf5))
- read insulator v1 config at first startup ([#137](https://github.com/andrewinci/insulator2/issues/137)) ([6d06698](https://github.com/andrewinci/insulator2/commit/6d06698e623ade257645c82d5ac4081e5753ca8f))

# [1.17.0](https://github.com/andrewinci/insulator2/compare/v1.16.0...v1.17.0) (2022-11-04)

### Bug Fixes

- **be:** Use fair mutex to syncronise multiple consumers writing to sqlite ([b95b2b2](https://github.com/andrewinci/insulator2/commit/b95b2b2d453ee23454d823f76aa6752f0735044c))
- **fe:** remove padding in the main page ([7066e7f](https://github.com/andrewinci/insulator2/commit/7066e7fb760585bbdcd5ac6f0cd96cd5a35a33ad))
- Get result size using the query ([971674a](https://github.com/andrewinci/insulator2/commit/971674a8b66504eee84f2654e6108f22de483618))

### Features

- add button to delete a specific schema version ([b54e0d2](https://github.com/andrewinci/insulator2/commit/b54e0d2a09d024e03528828751dd120c9fb45a80))
- add button to delete a topic ([d7005e6](https://github.com/andrewinci/insulator2/commit/d7005e6cdb14c75065d0db6b7fe72313508c4010))
- add delete schema button ([436dd58](https://github.com/andrewinci/insulator2/commit/436dd58c6847c274ab6781189c6b4724de268274))
- **fe:** click enter to select the first cluster from the search bar ([ff4488c](https://github.com/andrewinci/insulator2/commit/ff4488c57ed979ae1eeee2898efb2ca03084aa4c))
- **fe:** show loader between pages in records-list ([b1523ae](https://github.com/andrewinci/insulator2/commit/b1523ae781820815172385fe4f4596faa55b9174))
- **ux:** double enter to select the first item that match the search ([0f756f9](https://github.com/andrewinci/insulator2/commit/0f756f938aff08475849b1246cfa0782afa77b3c))
- **ux:** show query in an allotment instead of a modal ([4ef8911](https://github.com/andrewinci/insulator2/commit/4ef8911be345a4d51653eaeb2c6153fa51f30f5e))

### Performance Improvements

- **be:** cache parsed avro schema ([b229189](https://github.com/andrewinci/insulator2/commit/b229189b0ea1ad1593c8f9f59d9a9c7ef90f57ba))

# [1.16.0](https://github.com/andrewinci/insulator2/compare/v1.15.0...v1.16.0) (2022-11-03)

### Bug Fixes

- **be:** Invalid assertion on config values ([9c6c5b0](https://github.com/andrewinci/insulator2/commit/9c6c5b0c7ab47e013095e926f463f217c95f945c))
- **BE:** stop consumer ([dec90c5](https://github.com/andrewinci/insulator2/commit/dec90c59575095e6ed067286c3ef8923e26b5192))
- **BE:** Use fair mutex ([48af3c9](https://github.com/andrewinci/insulator2/commit/48af3c98e64544fa99da8de201167e8f41227d91))
- deadlock in topicPartition list cache ([a2afcf1](https://github.com/andrewinci/insulator2/commit/a2afcf1f7d9a7b7470d4f1594cbb714c9556f437))
- **FE:** avoid to store empty strings for configs ([6939773](https://github.com/andrewinci/insulator2/commit/6939773ccda33efba2717d99f0b86e242bd1334d))
- **FE:** dayjs call namespace ([9d3dea3](https://github.com/andrewinci/insulator2/commit/9d3dea3bee8edba60a21202270942c0474831329))
- flickering while consuming a topic ([abbec33](https://github.com/andrewinci/insulator2/commit/abbec337207db51e530ea537c1c86b172cf5d393))
- Out of range due to difference between usize ([cbbec11](https://github.com/andrewinci/insulator2/commit/cbbec110049546f28b85023c388e54a7645ff044))
- Reset topics/partitions cache when a new topic is addedd ([894bb3c](https://github.com/andrewinci/insulator2/commit/894bb3ce6f8d7ae2b6599e1aa5715b20dc4eabf1))
- text input null exception when using currentTarget ([0ed96cf](https://github.com/andrewinci/insulator2/commit/0ed96cfd0763b5bf16db6a38ec667c7d73e4dddf))

### Features

- **FE:** use mod + f to focus the search bar ([1292c70](https://github.com/andrewinci/insulator2/commit/1292c70deb18c365882dcc3080bf64dff45283a0))
- query records ([8768851](https://github.com/andrewinci/insulator2/commit/8768851b3ee76577ae93651e05e01e89467e1d03))
- use infinite scroll in records list ([b7ea2e0](https://github.com/andrewinci/insulator2/commit/b7ea2e0215acbf4c4a950d1963115a68b500e0bb))
- Use sqlite as recors storage ([7a27155](https://github.com/andrewinci/insulator2/commit/7a2715528cccc5ff082d68f5e62c3bd81fb2d280))

### Performance Improvements

- only build a schema registry client if a config is defined ([ec1b4bc](https://github.com/andrewinci/insulator2/commit/ec1b4bc6ca419646a4ab37a95f3da00993b5ba34))

# [1.15.0](https://github.com/andrewinci/insulator2/compare/v1.14.2...v1.15.0) (2022-10-27)

### Bug Fixes

- duplicates in consumer group view ([42eb3de](https://github.com/andrewinci/insulator2/commit/42eb3de30b82c0054d60e991b7defbf5a5f510d3))

### Features

- **FE:** show search bar in cluster view ([7e5460a](https://github.com/andrewinci/insulator2/commit/7e5460ae1e270ac8c40a1258931ddabc5206f4b9))
- make search bar configurable from settings ([1db0e24](https://github.com/andrewinci/insulator2/commit/1db0e240d11b7a02978fa3e15b2d093c3701a212))
- use regex in search bar ([584e0a7](https://github.com/andrewinci/insulator2/commit/584e0a713efbb9aa31d1c80858f9970949624cf0))

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
