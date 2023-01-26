---
layout: default
---

Insulator2 is an open-source tool that aims to improve the experience of working with Kafka clusters.
In particular if focuses in simplify the management of topics, schemas and consumer groups.

## Download
<a href="https://github.com/andrewinci/insulator2/releases/latest/" > 
 <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/andrewinci/insulator2?style=plastic">
</a>

[Download](https://github.com/andrewinci/insulator2/releases/latest/download/Insulator.2_2.10.0_x64.dmg): Mac OS X (.dmg)  
[Download](https://github.com/andrewinci/insulator2/releases/latest/download/Insulator.2.exe): Windows (.exe)  
[Download](https://github.com/andrewinci/insulator2/releases/latest/download/Insulator.2_2.10.0_x64_en-US.msi): Windows (.msi _Require admin access_)  
[Download](https://github.com/andrewinci/insulator2/releases/latest/download/insulator-2_2.10.0_amd64.AppImage): Linux (.AppImage)  
[Download](https://github.com/andrewinci/insulator2/releases/latest/download/insulator-2_2.10.0_amd64.deb): Debian (.deb)  

## Topic management
![Topic management](/assets/topic-management.png)
- View a list of all topics in a Kafka cluster and filter them using regex.
- Create, delete and manage topics.
- Add frequently used topics to a favorites list.
- Consume data from topics with support for Avro and utf8 decoding.
- Configure the consumer to consume data within a specific time range or all records.
- Query consumed records using SQL as they are stored in an in-memory SQLite database.
- Export consumed records to CSV.
- Produce data to a topic with support for Avro and utf8 encoding.

## Schema registry management
![Schema registry management](/assets/schema-management.png)
- View a list of all subjects and schema versions.
- Create, delete and manage schemas or subjects.
- Add frequently used subjects to a favorites list.

## Consumer group management
![Consumer group management](/assets/consumer-management.png)
- View a list of all consumer groups.
- Create, delete and manage consumer groups.
- Add frequently used consumer groups to a favorites list.
- Monitor the status and lag of consumer groups by partition.
- Reset consumer group offsets to the beginning/end or a specific timestamp.

## Multi-cluster support
![Topic management](/assets/clusters.png)

## Credits

Insulator2 is a cross-platform tool that can be run on Windows, macOS and Linux, it's built using [Tauri framework](https://tauri.app/).
The frontend is built using [Mantine](https://mantine.dev/) and [React](https://reactjs.org/).
To interact with Kafka, Insulator2 uses [rust-rdkafka](https://github.com/fede1024/rust-rdkafka).

## Acknowledgements
⚠️ Insulator2 is open-source and free to use under the limitation of the license GPL3. 
It is still under development and it's not yet recommended for production use.

## Support
If you want to support the development of Insulator2 you can buy me a coffee ☕️ or star the project on GitHub ⭐️

<a href="https://www.buymeacoffee.com/andreavinci" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

<iframe src="https://ghbtns.com/github-btn.html?user=andrewinci&repo=insulator2&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe>