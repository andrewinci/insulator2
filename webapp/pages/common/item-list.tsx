import {
  Container,
  Group,
  NavLink,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Text,
  Tabs,
  Badge,
  Grid,
  FocusTrap,
  useMantineTheme,
} from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
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
  favorites: string[];
  onFavToggled: (item: string) => void;
  onItemSelected: (item: string) => void;
  onRefreshList: () => void;
  onAddClick?: () => void;
};

// Common list page component
export const ItemList = (props: ItemListProps) => {
  const { onItemSelected, onRefreshList, onAddClick, onFavToggled } = props;
  const { listId, items, title, isLoading, isFetching, favorites } = props;
  const [searchText, setSearchText] = useState<string>("");
  const [focus, setOnFocus] = useState<string | undefined>(undefined);
  const [state, setState] = useSessionStorage<{
    recent: string[];
    selected?: string;
  }>({
    key: listId,
    defaultValue: {
      recent: [],
    },
  });
  const { userSettings } = useUserSettings();

  const filteredItems = useMemo(() => {
    try {
      const regex = new RegExp(searchText ?? ".", "i");
      const test = userSettings.useRegex
        ? (s: string) => regex.test(s)
        : (s: string) => s.toLowerCase().includes(searchText ?? "");
      return {
        all: items.filter((t) => test(t)).sort(),
        recent: state.recent.filter((t) => items.includes(t) && test(t)).reverse(),
        favorites: favorites.filter((f) => items.includes(f)),
      };
    } catch {
      return {
        all: [],
        recent: [],
        favorites: [],
      };
    }
  }, [searchText, userSettings.useRegex, items, state.recent, favorites]);

  const onItemSelectedOnTab = (selectedItem: string) => {
    // remove any item in focus
    setOnFocus(undefined);
    setState((s) => {
      // avoid duplicates in the recent list
      let newState = { ...s, selected: selectedItem };
      if (!s.recent.includes(selectedItem)) {
        newState = { ...newState, recent: [selectedItem, ...s.recent] };
      }
      return newState;
    });
    // forward upstream
    onItemSelected(selectedItem);
  };

  return (
    <Container>
      <PageHeader title={title} subtitle={`Total: ${props.items.length}`}>
        <SearchInput
          placeholder={userSettings.useRegex ? "Search (regex)" : "Search"}
          value={searchText}
          onChange={(v) => setSearchText(v)}
          onEnter={() => setOnFocus(filteredItems.all[0])}
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
      <Tabs mt={10} variant="pills" defaultValue={"all"}>
        <Tabs.List grow>
          <TabHeader title="All" icon="all" count={props.items.length} filtered={filteredItems.all.length} />
          <TabHeader title="Favorites" icon="favorites" count={0} filtered={filteredItems.favorites.length} />
          <TabHeader title="Recent" icon="recent" count={state.recent.length} filtered={filteredItems.recent.length} />
        </Tabs.List>
        {(
          [
            ["all", filteredItems.all],
            ["favorites", filteredItems.favorites],
            ["recent", filteredItems.recent],
          ] as [string, string[]][]
        ).map(([title, items]) => (
          <TabPanel
            key={title}
            title={title}
            items={items}
            favorites={favorites}
            isLoading={isLoading}
            selected={state.selected}
            focus={focus}
            onFavToggled={onFavToggled}
            onItemSelected={onItemSelectedOnTab}
          />
        ))}
      </Tabs>
    </Container>
  );
};

type TabPanelProps = {
  title: string;
  items: string[];
  favorites: string[];
  isLoading: boolean;
  selected?: string;
  focus?: string;
  onItemSelected: (item: string) => void;
  onFavToggled: (item: string) => void;
};

const TabPanel = ({
  title,
  items,
  isLoading,
  favorites,
  selected,
  focus,
  onFavToggled,
  onItemSelected,
}: TabPanelProps) => {
  const [windowSize, setWindowSize] = useState(getWindowSize());
  useEffect(() => {
    const handleWindowResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);
  const backgroundColor = useMantineTheme().colorScheme == "light" ? "white" : "black";
  return (
    <Tabs.Panel value={title} pt="xs">
      {isLoading && (
        <Center mt={10}>
          <Loader />
        </Center>
      )}
      {!isLoading && items.length > 0 ? (
        <FixedSizeList height={windowSize.innerHeight - 150} itemCount={items.length} itemSize={38} width={"100%"}>
          {({ index, style }) => (
            <Grid style={style} grow gutter={0} justify={"flex-start"} align="center">
              <Grid.Col span="auto" sx={{ maxWidth: "30px" }}>
                <ActionIcon color="orange" radius="xl" onClick={() => onFavToggled(items[index])}>
                  <IconStar
                    fill={favorites.includes(items[index]) ? "orange" : backgroundColor}
                    size={16}
                    stroke={1.5}
                  />
                </ActionIcon>
              </Grid.Col>
              <Grid.Col span={11}>
                <FocusTrap active={focus == items[index]}>
                  <NavLink
                    sx={(theme) => ({
                      "&:hover": {
                        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.blue[0],
                      },
                      borderRadius: "5px",
                    })}
                    active={items[index] == selected}
                    onClick={() => onItemSelected(items[index])}
                    rightSection={<IconChevronRight size={12} stroke={1.5} />}
                    noWrap
                    label={<Text sx={{ maxWidth: "300px" }}>{items[index]}</Text>}
                  />
                </FocusTrap>
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
