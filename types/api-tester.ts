import { Operation, OpenAPISpec, Server } from "./openapi";

export interface ApiRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface ResponseState {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timing: number;
}

export interface ApiTesterProps {
  opened: boolean;
  onClose: () => void;
  path: string;
  method: string;
  operation: Operation;
  spec: OpenAPISpec;
  servers?: Server[];
}
