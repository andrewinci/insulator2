import { Center, Text } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFavorites } from "../../hooks/use-favorites";
import { useUserSettings } from "../../providers";
import { useListSubjects } from "../../tauri/schema-registry";
import { Schema } from "./schema";
import { AddSchemaModal } from "./add-schema-modal";
import { ItemList, TwoColumnPage } from "../../components";

export const SchemasPage = () => {
  const { clusterId, isSchemaRegistryConfigured, activeSchemaName, setActiveSchemaName } = useSchemaRegistry();
  const { data: subjects, isLoading, isFetching, refetch } = useListSubjects(clusterId);
  const [addSchemaModalOpened, setAddSchemaModalOpened] = useState(false);
  const { favorites, toggleFavorite } = useFavorites(clusterId, "schemas");
  const onDeleteSubject = (name: string) => {
    if (activeSchemaName == name) {
      setActiveSchemaName(undefined);
    }
    refetch();
  };
  if (isSchemaRegistryConfigured && clusterId) {
    // a schema has been selected, show the allotment
    return (
      <TwoColumnPage
        title="Schema registry"
        left={
          <>
            <ItemList
              title="Schemas"
              listId={`schemas-${clusterId}`}
              isLoading={isLoading}
              isBackgroundRefreshing={isFetching}
              favorites={favorites}
              onFavToggled={toggleFavorite}
              items={subjects ?? []}
              onAddClick={() => setAddSchemaModalOpened(true)}
              onItemSelected={setActiveSchemaName}
              onRefreshList={refetch}
            />
            <AddSchemaModal
              opened={addSchemaModalOpened}
              onClose={() => refetch().then((_) => setAddSchemaModalOpened(false))}
              clusterId={clusterId}
              subjects={subjects ?? []}
            />
          </>
        }
        right={
          activeSchemaName && (
            <Schema clusterId={clusterId} schemaName={activeSchemaName} onSubjectDeleted={onDeleteSubject} />
          )
        }
      />
    );
  } else
    return (
      <Center mt={20}>
        <Text>Missing schema registry configuration</Text>
      </Center>
    );
};

const useSchemaRegistry = () => {
  const { clusterId, schemaName: navSchemaName } = useParams();
  const [state, setState] = useSessionStorage({
    key: `schema-main-${clusterId}`,
    defaultValue: {
      schemaName: navSchemaName,
    },
  });
  const { userSettings: appState } = useUserSettings();
  const schemaRegistry = appState.clusters.find((c) => c.id == clusterId)?.schemaRegistry;
  if (!clusterId) throw "Cluster id must be set";
  return {
    clusterId,
    isSchemaRegistryConfigured: schemaRegistry && schemaRegistry.endpoint,
    activeSchemaName: state.schemaName,
    setActiveSchemaName: (schemaName: string | undefined) => setState({ schemaName }),
  };
};
