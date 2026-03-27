import { Stack } from "expo-router";
import { memo } from "react";

function ProjectsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}

export default memo(ProjectsLayout);
