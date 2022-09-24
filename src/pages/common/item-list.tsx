import {
  Container,
  Divider,
  Title,
  Group,
  NavLink,
  Input,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Text,
} from "@mantine/core";
import { IconPlus, IconRefresh, IconSearch } from "@tabler/icons";
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
};

// Common list page component
export const ItemList = (props: ItemListProps) => {
  const { onItemSelected, onRefreshList, items, title, loading } = props;
  const [state, setState] = useState<{ search?: string }>({});
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
    <Container style={{ width: "100%" }}>
      <Group position={"apart"}>
        <Title>{title}</Title>
        <Group>
          <Tooltip label="Create a new item">
            <ActionIcon disabled={true}>
              <IconPlus></IconPlus>
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Refresh list">
            <ActionIcon onClick={onRefreshList}>
              <IconRefresh></IconRefresh>
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Divider mt={10} />
      <Input
        my={10}
        icon={<IconSearch />}
        placeholder="Search"
        value={state.search}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(v: any) => {
          if (v) setState({ ...state, search: v.target.value.toLowerCase() });
        }}
      />
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
              label={filteredItems[index]}
            />
          )}
        </FixedSizeList>
      ) : (
        <Center mt={20}>
          <Text>Empty list</Text>
        </Center>
      )}
    </Container>
  );
};
