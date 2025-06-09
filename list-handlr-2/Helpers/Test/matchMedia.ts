import { MatchMediaMock } from "match-media-mock";

export interface MockWindow extends Window {
  matchMedia: MatchMediaMock;
}

export function setupBrowserWidth(width: number) {
  (window as unknown as MockWindow).matchMedia.setConfig({
    type: "screen",
    width: width,
  });
}
