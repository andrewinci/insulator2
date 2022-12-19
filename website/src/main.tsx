import React from "react";
import ReactDOM from "react-dom/client";
import { Stack, Text, Image } from "@mantine/core";
import { Section } from "./section";
import { TopLevel } from "./top-level";
import consume_and_export from "../assets/consume_and_export.gif"


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Stack spacing={0} style={{ position: "absolute", top: 0, left: 0, padding: 0, margin: 0, height: "100vh", width: "100vw" }}>
      <TopLevel />
      <Section
        color="light"
        title="Query your topics"
        subtitle={"Insulator consumer is configurable to set the start and the end timestamp.\nAll records are ingested into a sqlite table as json in order to provide queryability at field level."}
        left={
          <Text >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ac enim ac magna ultricies aliquet. Ut ultrices dui in mi pulvinar maximus. Pellentesque ut neque sed nunc tempus bibendum. Pellentesque feugiat lorem ut tincidunt gravida. Integer lobortis eros eros, eu elementum justo interdum quis. Vivamus in ornare nibh. Vestibulum lacinia ipsum ac velit vestibulum, eu laoreet turpis ultricies. Vestibulum vitae pulvinar mi. Mauris tincidunt bibendum magna. Proin porta hendrerit lacus id rutrum.
          </Text>
        }
        right={
          <Image width={600} src={consume_and_export} alt="query consume and export" />
        }
      />
      <Section
        color="dark"
        title="Schema registry"
        subtitle={"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ac enim ac magna ultricies aliquet."}
        left={
          <Image width={600} src={consume_and_export} alt="query consume and export" />
        }
        right={
          <Text color="white" >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ac enim ac magna ultricies aliquet. Ut ultrices dui in mi pulvinar maximus. Pellentesque ut neque sed nunc tempus bibendum. Pellentesque feugiat lorem ut tincidunt gravida. Integer lobortis eros eros, eu elementum justo interdum quis. Vivamus in ornare nibh. Vestibulum lacinia ipsum ac velit vestibulum, eu laoreet turpis ultricies. Vestibulum vitae pulvinar mi. Mauris tincidunt bibendum magna. Proin porta hendrerit lacus id rutrum.
          </Text>
        }
      />
    </Stack>
  </React.StrictMode>
);
