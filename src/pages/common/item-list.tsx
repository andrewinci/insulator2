import {
  Container,
  Divider,
  Title,
  Group,
  NavLink,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Text,
  Tabs,
  Badge,
  TextInput,
} from "@mantine/core";
import { IconClock, IconList, IconPlus, IconRefresh, IconSearch, IconStar } from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";

const getWindowSize = () => {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
};

type ItemListProps = {
  title: string;
  items: string[];
  loading: boolean;
  onItemSelected: (item: string) => void;
  onRefreshList: () => void;
  onAddClick?: () => void;
};

// Common list page component
export const ItemList = (props: ItemListProps) => {
  const { onItemSelected, onRefreshList, onAddClick, items, title, loading } = props;
  const [state, setState] = useState<{ search: string; recent: Map<string, void> }>({
    search: "",
    recent: new Map<string, void>(),
  });
  const [windowSize, setWindowSize] = useState(getWindowSize());

  useEffect(() => {
    const handleWindowResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const filteredItems = useMemo(
    () => items.filter((t) => t.toLowerCase().includes(state.search ?? "")).sort(),
    [state.search, items]
  );

  return (
    <Container>
      <Group align={"center"} position={"apart"}>
        <Title>{title}</Title>
        <TextInput
          size="xs"
          style={{ width: "40%" }}
          icon={<IconSearch />}
          placeholder="Search"
          value={state.search}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(v: any) => {
            if (v) setState({ ...state, search: v.target.value.toLowerCase() });
          }}
        />
        <Group>
          <Tooltip label="Create a new item">
            <ActionIcon size="sm" disabled={onAddClick == undefined} onClick={onAddClick}>
              <IconPlus></IconPlus>
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Refresh list">
            <ActionIcon size="sm" onClick={onRefreshList}>
              <IconRefresh></IconRefresh>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Divider mt={10} />
      <Tabs mt={10} variant="pills" defaultValue="all">
        <Tabs.List grow>
          <Tabs.Tab
            sx={{ height: 30 }}
            rightSection={
              <Badge
                //sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                variant="filled"
                size="md"
                p={3}>
                {filteredItems.length}/{props.items.length}
              </Badge>
            }
            value="all"
            icon={<IconList size={14} />}>
            All
          </Tabs.Tab>
          <Tabs.Tab disabled sx={{ height: 30 }} value="recent" icon={<IconClock size={14} />}>
            Recent
          </Tabs.Tab>
          <Tabs.Tab disabled sx={{ height: 30 }} value="favorites" icon={<IconStar size={14} />}>
            Favorites
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all" pt="xs">
          {/* todo: fix the below mess */}
          {loading ? (
            <Center mt={10}>
              <Loader />
            </Center>
          ) : filteredItems.length > 0 ? (
            <FixedSizeList
              height={windowSize.innerHeight - 150}
              itemCount={filteredItems.length}
              itemSize={38}
              width={"100%"}>
              {({ index, style }) => (
                <NavLink
                  onClick={() => onItemSelected(filteredItems[index])}
                  style={style}
                  noWrap
                  label={filteredItems[index]}
                />
              )}
            </FixedSizeList>
          ) : (
            <Center mt={20}>
              <Text>Empty list</Text>
            </Center>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="recent" pt="xs">
          <Center mt={20}>
            <Text>Empty list</Text>
          </Center>
        </Tabs.Panel>

        <Tabs.Panel value="favorites" pt="xs">
          <Center mt={20}>
            <Text>Empty list</Text>
          </Center>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};
