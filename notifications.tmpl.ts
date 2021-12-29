/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export const url = "/notifications.json";

type environment = "linux" | "win32" | "darwin" | "extension";
interface Notification {
  id: string;
  // https://feathericons.com/
  icon: string;
  color:
    | "gray"
    | "brown"
    | "orange"
    | "yellow"
    | "green"
    | "blue"
    | "purple"
    | "pink"
    | "red";
  message: string;
  link?: string;
  // semver e.g. 0.11.0
  version: string;
  environments?: environment[];
}

const notifications: Notification[] = [];

export default JSON.stringify(notifications);
