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
  Grid,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconChevronRight, IconClock, IconList, IconPlus, IconRefresh, IconSearch, IconStar } from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";

const getWindowSize = () => {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
};

type ItemListProps = {
  title: string;
  //unique identifier for the list used for local storage of recent visited items
  listId: string;
  items: string[];
  isLoading: boolean;
  isFetching: boolean;
  onItemSelected: (item: string) => void;
  onRefreshList: () => void;
  onAddClick?: () => void;
};

// Common list page component
export const ItemList = (props: ItemListProps) => {
  const { onItemSelected, onRefreshList, onAddClick } = props;
  const { listId, items, title, isLoading, isFetching } = props;
  const [state, setState] = useLocalStorage<{
    search: string;
    recent: string[];
    favorites: string[];
    selected?: string;
  }>({
    key: listId,
    defaultValue: {
      search: "",
      favorites: [],
      recent: [],
    },
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
      recent: state.recent.filter((t) => t.toLowerCase().includes(state.search ?? "")).reverse(),
      favorites: state.favorites.filter((t) => t.toLowerCase().includes(state.search ?? "")),
    }),
    [items, state.recent, state.search, state.favorites]
  );

  const tabPanel = (title: string, panelItems: string[]) => (
    <Tabs.Panel value={title} pt="xs">
      {isLoading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}
      {!isLoading && panelItems.length > 0 ? (
        <FixedSizeList height={windowSize.innerHeight - 150} itemCount={panelItems.length} itemSize={38} width={"100%"}>
          {({ index, style }) => (
            <Grid style={style} grow gutter={0} justify={"flex-start"} align="center">
              <Grid.Col span="auto" sx={{ maxWidth: "30px" }}>
                <ActionIcon
                  color="yellow"
                  radius="xl"
                  onClick={() => {
                    // toggle item from the favorites list
                    const newItem = panelItems[index];
                    if (state.favorites.includes(newItem))
                      setState((s) => ({ ...s, favorites: s.favorites.filter((f) => f != newItem) }));
                    else setState((s) => ({ ...s, favorites: [...s.favorites, newItem] }));
                  }}>
                  <IconStar
                    fill={filteredItems.favorites.includes(panelItems[index]) ? "yellow" : undefined}
                    size={16}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Grid.Col>
              <Grid.Col span={11}>
                <NavLink
                  sx={(theme) => ({
                    "&:hover": {
                      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.blue[0],
                    },
                    borderRadius: "5px",
                  })}
                  active={panelItems[index] == state.selected}
                  onClick={() => {
                    const selectedItem = panelItems[index];
                    // avoid duplicates in the recent list
                    const newRecent = state.recent.filter((i) => i != selectedItem);
                    newRecent.push(selectedItem);
                    setState((s) => ({ ...s, recent: newRecent, selected: selectedItem }));
                    onItemSelected(selectedItem);
                  }}
                  rightSection={<IconChevronRight size={12} stroke={1.5} />}
                  noWrap
                  label={<Text sx={{ maxWidth: "300px" }}>{panelItems[index]}</Text>}
                />
              </Grid.Col>
            </Grid>
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
            <ActionIcon loading={isFetching} size="sm" onClick={onRefreshList}>
              <IconRefresh></IconRefresh>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Divider mt={10} />
      <Tabs mt={10} variant="pills" defaultValue="all">
        <Tabs.List grow>
          <TabHeader title="All" icon="all" count={props.items.length} filtered={filteredItems.all.length} />
          <TabHeader title="Favorites" icon="favorites" count={0} filtered={filteredItems.favorites.length} />
          <TabHeader title="Recent" icon="recent" count={state.recent.length} filtered={filteredItems.recent.length} />
        </Tabs.List>
        {tabPanel("all", filteredItems.all)}
        {tabPanel("favorites", filteredItems.favorites)}
        {tabPanel("recent", filteredItems.recent)}
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
