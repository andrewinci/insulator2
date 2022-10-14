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
  const [state, setState] = useState<{ search: string; recent: string[] }>({
    search: "",
    recent: [],
  });
  const [windowSize, setWindowSize] = useState(getWindowSize());

  useEffect(() => {
    const handleWindowResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const filteredItems = useMemo(
    () => ({
      all: items.filter((t) => t.toLowerCase().includes(state.search ?? "")).sort(),
      recent: state.recent.filter((t) => t.toLowerCase().includes(state.search ?? "")).sort(),
      favorites: [],
    }),
    [items, state.recent, state.search]
  );

  const tabPanel = (title: string, panelItems: string[]) => (
    <Tabs.Panel value={title} pt="xs">
      {loading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}
      {!loading && panelItems.length > 0 ? (
        <FixedSizeList height={windowSize.innerHeight - 150} itemCount={panelItems.length} itemSize={38} width={"100%"}>
          {({ index, style }) => (
            <NavLink
              onClick={() => {
                const selectedItem = panelItems[index];
                // avoid duplicates in the recent list
                const newRecent = state.recent.filter((i) => i != selectedItem);
                newRecent.push(selectedItem);
                setState((s) => ({ ...s, recent: newRecent }));
                onItemSelected(selectedItem);
              }}
              style={style}
              noWrap
              label={panelItems[index]}
            />
          )}
        </FixedSizeList>
      ) : (
        <Center mt={20}>
          <Text>Empty list</Text>
        </Center>
      )}
    </Tabs.Panel>
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
          <TabHeader title="All" icon="all" count={props.items.length} filtered={filteredItems.all.length} />
          <TabHeader title="Recent" icon="recent" count={state.recent.length} filtered={filteredItems.recent.length} />
          <TabHeader title="Favorites" icon="favorites" count={0} filtered={filteredItems.favorites.length} />
        </Tabs.List>

        {tabPanel("all", filteredItems.all)}
        {tabPanel("recent", filteredItems.recent)}

        <Tabs.Panel value="favorites" pt="xs">
          <Center mt={20}>
            <Text>Empty list</Text>
          </Center>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

const TabHeader = (props: { title: string; count: number; filtered: number; icon: "all" | "recent" | "favorites" }) => {
  const iconElement = useMemo(() => {
    switch (props.icon) {
      case "all":
        return <IconList size={14} />;
      case "recent":
        return <IconClock size={14} />;
      case "favorites":
        return <IconStar size={14} />;
    }
  }, [props.icon]);

  return (
    <Tabs.Tab
      sx={{ height: 30 }}
      rightSection={
        <Badge variant="filled" size="md" p={3}>
          {props.filtered} / {props.count}
        </Badge>
      }
      value={props.title.toLowerCase()}
      icon={iconElement}>
      {props.title}
    </Tabs.Tab>
  );
};
