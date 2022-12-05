import { Box, Center, Divider, Group, Image, Navbar, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { IconCircleDashed, IconLine, IconSatellite, IconServer, IconSettings } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { getVersion } from "@tauri-apps/api/app";
import { useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";

import logo from "../../src-tauri/icons/128x128.png";
import { useUserSettings } from "../providers";
import { SidebarItem } from "./sidebar-item";

export const SideBar = () => {
  const { userSettings: appState } = useUserSettings();
  const location = useLocation();
  const { data: appVersion } = useQuery(["insulatorVersion"], getVersion);
  const { clusterName, clusterId, activeItem } = useMemo(() => {
    const { clusterId, activeItem } = matchPath("/cluster/:clusterId/:activeItem/*", location.pathname)?.params ?? {};
    const clusterName = appState.clusters.find((c) => c.id == clusterId)?.name;
    return { clusterName, clusterId, activeItem };
  }, [location, appState]);
  return (
    <Navbar width={{ base: 220 }} p="xs">
      <Navbar.Section>
        <Center mt={5}>
          <Stack align={"center"} spacing={0}>
            <Group style={{ height: "32px" }} spacing={10}>
              <Image width={30} height={30} src={logo} alt="insulator" />
              <Title order={2}>Insulator</Title>
            </Group>
            <Text size={12}>v{appVersion}</Text>
          </Stack>
        </Center>
        <Divider mt={5} />
      </Navbar.Section>
      {clusterName && (
        <Navbar.Section mt="xs">
          <Text size={18} align={"center"}>
            {clusterName}
          </Text>
        </Navbar.Section>
      )}
      <Navbar.Section grow component={ScrollArea} mt="-xs" mx="-xs" px="xs">
        <Box py="md">
          <SidebarItem
            url={clusterId ? `/cluster/${clusterId}/clusters` : "/clusters/"}
            active={activeItem == "clusters"}
            icon={<IconServer size={16} />}
            color={"blue"}
            label={"Clusters"}
          />
          {/* Only show kafka operations if a cluster is selected */}
          {clusterName && (
            <>
              <SidebarItem
                url={`/cluster/${clusterId}/topics/`}
                active={activeItem == "topics"}
                icon={<IconLine size={16} />}
                color={"orange"}
                label={"Topics"}
              />
              <SidebarItem
                url={`/cluster/${clusterId}/schemas`}
                active={activeItem == "schemas"}
                icon={<IconSatellite size={16} />}
                color={"green"}
                label={"Schema Registry"}
              />
              <SidebarItem
                url={`/cluster/${clusterId}/consumers`}
                active={activeItem == "consumers"}
                icon={<IconCircleDashed size={16} />}
                color={"violet"}
                label={"Consumer groups"}
              />
            </>
          )}
          <SidebarItem
            url={clusterId ? `/cluster/${clusterId}/settings` : `/settings`}
            active={activeItem == "settings"}
            icon={<IconSettings size={16} />}
            color={"red"}
            label={"Settings"}
          />
        </Box>
      </Navbar.Section>
    </Navbar>
  );
};
