import { Text, Divider, Image, Box, Center, Group, Navbar, ScrollArea, Title, Stack } from "@mantine/core";
import { SidebarItem } from "./sidebar-item";
import { IconCircleDashed, IconLine, IconSatellite, IconServer, IconSettings } from "@tabler/icons";
import logo from "../../src-tauri/icons/128x128.png";
import { matchPath, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useUserSettings } from "../providers";
import { getVersion } from "@tauri-apps/api/app";
import { useQuery } from "@tanstack/react-query";

export const SideBar = () => {
  const { userSettings: appState } = useUserSettings();
  const location = useLocation();
  const { data: appVersion } = useQuery(["insulatorVersion"], getVersion);
  const { clusterName, clusterId } = useMemo(() => {
    const { clusterId } = matchPath("/cluster/:clusterId/*", location.pathname)?.params ?? {};
    const clusterName = appState.clusters.find((c) => c.id == clusterId)?.name;
    return { clusterName, clusterId };
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
            icon={<IconServer size={16} />}
            color={"blue"}
            label={"Clusters"}
          />
          {/* Only show kafka operations if a cluster is selected */}
          {clusterName && (
            <>
              <SidebarItem
                url={`/cluster/${clusterId}/topics/`}
                icon={<IconLine size={16} />}
                color={"orange"}
                label={"Topics"}
              />
              <SidebarItem
                url={`/cluster/${clusterId}/schemas`}
                icon={<IconSatellite size={16} />}
                color={"green"}
                label={"Schema Registry"}
              />
              <SidebarItem
                url={`/cluster/${clusterId}/consumers`}
                icon={<IconCircleDashed size={16} />}
                color={"violet"}
                label={"Consumer groups"}
              />
            </>
          )}
          <SidebarItem
            url={clusterId ? `/cluster/${clusterId}/settings` : `/settings`}
            icon={<IconSettings size={16} />}
            color={"red"}
            label={"Settings"}
          />
        </Box>
      </Navbar.Section>
    </Navbar>
  );
};
