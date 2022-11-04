import { Container, Group, NavLink, Loader, Center, ActionIcon, Tooltip, Text, Tabs, Badge, Grid } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconChevronRight, IconClock, IconList, IconPlus, IconRefresh, IconStar } from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";
import { PageHeader, SearchInput } from "../../components";
import { useUserSettings } from "../../providers";

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
  const { userSettings } = useUserSettings();

  useEffect(() => {
    const handleWindowResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  const filteredItems = useMemo(() => {
    try {
      const regex = new RegExp(state?.search ?? ".", "i");
      const test = userSettings.useRegex
        ? (s: string) => regex.test(s)
        : (s: string) => s.toLowerCase().includes(state?.search ?? "");
      return {
        all: items.filter((t) => test(t)).sort(),
        recent: state.recent.filter((t) => test(t)).reverse(),
        favorites: state.favorites.filter((t) => test(t)),
      };
    } catch {
      return {
        all: [],
        recent: [],
        favorites: [],
      };
    }
  }, [items, state.recent, state.search, state.favorites, userSettings.useRegex]);

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
                  color="orange"
                  radius="xl"
                  onClick={() => {
                    // toggle item from the favorites list
                    const newItem = panelItems[index];
                    if (state.favorites.includes(newItem))
                      setState((s) => ({ ...s, favorites: s.favorites.filter((f) => f != newItem) }));
                    else setState((s) => ({ ...s, favorites: [...s.favorites, newItem] }));
                  }}>
                  <IconStar
                    fill={filteredItems.favorites.includes(panelItems[index]) ? "orange" : undefined}
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
      <PageHeader title={title} subtitle={`Total: ${props.items.length}`}>
        <SearchInput
          placeholder={userSettings.useRegex ? "Search (regex)" : "Search"}
          value={state.search}
          onChange={(v) => setState({ ...state, search: v })}
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
      </PageHeader>
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
          {props.filtered}
        </Badge>
      }
      value={props.title.toLowerCase()}
      icon={iconElement}>
      {props.title}
    </Tabs.Tab>
  );
};
