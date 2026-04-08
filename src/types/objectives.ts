export interface ObjectiveLine {
  text: string;
  done?: boolean;
}

export interface ObjectivePanelContent {
  title?: string;
  lines: ObjectiveLine[];
}
