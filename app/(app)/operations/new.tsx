import React from 'react';
import CreateLote from '../../../src/modules/operations/screens/CreateLote';
import { useProjectStore } from '../../../src/stores/projectStore';
import { Redirect } from 'expo-router';

export default function NewLoteScreen() {
    const { activeProject } = useProjectStore();

    if (!activeProject) {
        return <Redirect href="/(app)" />;
    }

    return (
        <CreateLote proyectoId={activeProject.id.toString()} />
    );
}
