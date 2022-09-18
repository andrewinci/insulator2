import { Box, Navbar, ScrollArea, Title } from "@mantine/core";
import { NavBarLink } from "./navbar-link";
import { IconServer } from "@tabler/icons";

export const SideBar = ({ clusterName }: { clusterName: string; }) => <Navbar width={{ base: 150 }} p="xs">
  <Navbar.Section mt="xs">
    <Title order={4}>{clusterName}</Title>
  </Navbar.Section>
  <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
    <Box py="md">
      <NavBarLink icon={<IconServer size={16} />} color={"blue"} label={"Clusters"} />
    </Box>
  </Navbar.Section>
</Navbar>;
