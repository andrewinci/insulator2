import { Text, Divider, Image, Box, Center, Group, Navbar, Title, Stack } from "@mantine/core";
import { SidebarItem } from "./sidebar-item";
import { IconCircleDashed, IconLine, IconSatellite, IconServer, IconSettings } from "@tabler/icons";
import logo from "../../../icons/128x128.png";
import { matchPath, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useUserSettings } from "../providers";
import { getVersion } from "@tauri-apps/api/app";
import { useQuery } from "@tanstack/react-query";
import { appWindow } from "@tauri-apps/api/window";
import { MinimizeButton } from "./minimize-button";

export const SideBar = () => {
  const { userSettings: appState } = useUserSettings();
  const location = useLocation();
  const { data: appVersion } = useQuery(["insulatorVersion"], getVersion);
  const { clusterName, clusterId, activeItem } = useMemo(() => {
    const { clusterId, activeItem } = matchPath("/cluster/:clusterId/:activeItem/*", location.pathname)?.params ?? {};
    const clusterName = appState.clusters.find((c) => c.id == clusterId)?.name;
    return { clusterName, clusterId, activeItem };
  }, [location, appState]);

  const [minimized, setMinimized] = useState(false);
  appWindow.setTitle(clusterName ? `Insulator 2 - ${clusterName}` : `Insulator 2`);
  const iconSize = minimized ? 20 : 16;
  return (
    <Navbar width={{ base: minimized ? 63 : 220 }} p="xs">
      <Navbar.Section>
        <Center style={{ height: "55px" }}>
          <Image hidden={!minimized} width={35} height={35} src={logo} alt="insulator" />
          <Stack mt={5} hidden={minimized} align={"center"} spacing={0}>
            <Group style={{ height: "32px" }} spacing={10}>
              <Image width={30} height={30} src={logo} alt="insulator" />
              <Title order={2}>Insulator</Title>
            </Group>
            <Text size={12}>v{appVersion}</Text>
          </Stack>
        </Center>
        <Divider mt={5} />
      </Navbar.Section>
      {clusterName && !minimized && (
        <Navbar.Section mt="xs">
          <Text size={18} align={"center"}>
            {clusterName}
          </Text>
        </Navbar.Section>
      )}
      <Navbar.Section grow mt="-xs" mx="-xs" px="xs">
        <Box py="md">
          <SidebarItem
            url={clusterId ? `/cluster/${clusterId}/clusters` : "/clusters/"}
            active={activeItem == "clusters"}
            icon={<IconServer size={iconSize} />}
            color={"blue"}
            label={"Clusters"}
            minimized={minimized}
          />
          {/* Only show kafka operations if a cluster is selected */}
          {clusterName && (
            <>
              <SidebarItem
                url={`/cluster/${clusterId}/topics/`}
                active={activeItem == "topics"}
                icon={<IconLine size={iconSize} />}
                color={"orange"}
                label={"Topics"}
                minimized={minimized}
              />
              <SidebarItem
                url={`/cluster/${clusterId}/schemas`}
                active={activeItem == "schemas"}
                icon={<IconSatellite size={iconSize} />}
                color={"green"}
                label={"Schema Registry"}
                minimized={minimized}
              />
              <SidebarItem
                url={`/cluster/${clusterId}/consumers`}
                active={activeItem == "consumers"}
                icon={<IconCircleDashed size={iconSize} />}
                color={"violet"}
                label={"Consumer groups"}
                minimized={minimized}
              />
            </>
          )}
          <SidebarItem
            url={clusterId ? `/cluster/${clusterId}/settings` : `/settings`}
            active={activeItem == "settings"}
            icon={<IconSettings size={iconSize} />}
            color={"red"}
            label={"Settings"}
            minimized={minimized}
          />
        </Box>
      </Navbar.Section>
      <MinimizeButton minimized={minimized} minimizeTarget="sidebar" onClick={() => setMinimized(!minimized)} />
    </Navbar>
  );
};
