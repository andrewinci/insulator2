import { Divider, Image, Box, Center, Group, Navbar, ScrollArea, Title } from "@mantine/core";
import { SidebarItem } from "./sidebar-item";
import { IconCircleDashed, IconLine, IconSatellite, IconServer, IconSettings } from "@tabler/icons";
import logo from "../../src-tauri/icons/128x128.png";

export const SideBar = ({ clusterName }: { clusterName?: string }) => (
  <Navbar width={{ base: 200 }} p="xs">
    <Navbar.Section>
      <Center>
        <Group spacing={10}>
          <Image width={30} height={30} src={logo} alt="insulator" />
          <Title order={2}>Insulator</Title>
        </Group>
      </Center>
      <Divider mt="sm" />
    </Navbar.Section>
    {clusterName && (
      <Navbar.Section mt="xs">
        <Center>
          <Title align="center" order={4}>
            {clusterName}
          </Title>
        </Center>
      </Navbar.Section>
    )}
    <Navbar.Section grow component={ScrollArea} mt="-xs" mx="-xs" px="xs">
      <Box py="md">
        <SidebarItem
          url={"clusters"}
          icon={<IconServer size={16} />}
          color={"blue"}
          label={"Clusters"}
        />
        {/* Only show kafka operations if a cluster is selected */}
        {clusterName && (
          <>
            <SidebarItem
              url={"topics"}
              icon={<IconLine size={16} />}
              color={"orange"}
              label={"Topics"}
            />
            <SidebarItem
              url={"schema-registry"}
              icon={<IconSatellite size={16} />}
              color={"green"}
              label={"Schema Registry"}
            />
            <SidebarItem
              url={"consumer-groups"}
              icon={<IconCircleDashed size={16} />}
              color={"violet"}
              label={"Consumer groups"}
            />
          </>
        )}
        <SidebarItem
          url={"settings"}
          icon={<IconSettings size={16} />}
          color={"red"}
          label={"Settings"}
        />
      </Box>
    </Navbar.Section>
  </Navbar>
);
