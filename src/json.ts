export type Json = string | number | boolean | Date | JsonObject | JsonArray;

export interface JsonObject {
  [x: string]: Json;
}

export type JsonArray = Array<string | number | boolean | Date | Json | JsonArray>;
