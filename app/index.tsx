import { Redirect } from "expo-router";

export default function Index() {
    // Root index redirects to app (auth check happens in _layout)
    return <Redirect href="/(app)" />;
}
