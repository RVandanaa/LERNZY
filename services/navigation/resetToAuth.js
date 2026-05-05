import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../../navigation/navigationRef";

export function resetToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Auth" }] }));
  }
}
