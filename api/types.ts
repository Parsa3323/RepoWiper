export interface ApiRequest {
  method?: string;
  headers: { cookie?: string };
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => ApiResponse;
  send: (body: string) => ApiResponse;
  end: () => ApiResponse;
  redirect: (url: string) => ApiResponse;
  setHeader: (name: string, value: string | string[]) => ApiResponse;
}
