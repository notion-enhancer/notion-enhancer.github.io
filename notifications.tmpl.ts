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
  version: string;
  environments?: environment[];
}

const notifications: Notification[] = [
  {
    "id": "46fd651e-2a9b-4a2c-8cc9-0d28ceec9aa7",
    "icon": "cloud",
    "color": "blue",
    "message": "Test cloud notification.",
    "link": "https://github.com/",
    "version": "0.11.0",
  },
];

export default JSON.stringify(notifications);
