// GENERATED FILE, DO NOT EDIT!!!
/* eslint-disable @typescript-eslint/no-explicit-any */

import OpenMowerBaseRpc from './rpc-base';

export type StringDoaGddGA = string;
export type BooleanVyG3AETh = boolean;
export interface ObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKM {
  job_id?: StringDoaGddGA;
  session_id?: StringDoaGddGA;
  blades?: BooleanVyG3AETh;
  [k: string]: any;
}
export type NumberHo1ClIqD = number;
export type UnorderedSetOfNumberHo1ClIqDAokMKuEf = NumberHo1ClIqD[];
export type UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G = UnorderedSetOfNumberHo1ClIqDAokMKuEf[];
export interface ObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4 {
  attributes?: ObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKM;
  points?: UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G;
  [k: string]: any;
}
export type UnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4Gkga5QR4 = ObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4[];
type AlwaysTrue = any;
export interface ObjectOfNumberHo1ClIqDNumberHo1ClIqDStringDoaGddGANumberHo1ClIqDStringDoaGddGAStringDoaGddGABooleanVyG3AEThUdvP47QF {
  id: StringDoaGddGA;
  t: NumberHo1ClIqD;
  type: StringDoaGddGA;
  x?: NumberHo1ClIqD;
  y?: NumberHo1ClIqD;
  job_id?: StringDoaGddGA;
  active?: BooleanVyG3AETh;
  [k: string]: any;
}
/**
 *
 * Content of a YAML file as a string
 *
 */
export type StringXJCrhoiv = string;
export interface ObjectHAgrRKSz { [key: string]: any; }
export type StringZDJW5SIj = "pong";
export type UnorderedSetOfStringDoaGddGADvj0XlFa = StringDoaGddGA[];
export type NullQu0Arl1F = null;
export interface ObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4Gkga5QR4UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GA4JKc1Ws {
  segments?: UnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4Gkga5QR4;
  buffer?: UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G;
  [k: string]: any;
}
export type UnorderedSetOfObjectOfNumberHo1ClIqDNumberHo1ClIqDStringDoaGddGANumberHo1ClIqDStringDoaGddGAStringDoaGddGABooleanVyG3AEThUdvP47QF12SAUrin = ObjectOfNumberHo1ClIqDNumberHo1ClIqDStringDoaGddGANumberHo1ClIqDStringDoaGddGAStringDoaGddGABooleanVyG3AEThUdvP47QF[];
/**
 *
 * Keys are relative file paths, values are YAML file contents as strings
 *
 */
export interface ObjectHicl3T4F { [key: string]: any; }
/**
 *
 * Generated! Represents an alias to any of the provided schemas
 *
 */
export type AnyOfObjectHAgrRKSzStringDoaGddGAStringZDJW5SIjUnorderedSetOfStringDoaGddGADvj0XlFaNullQu0Arl1FStringZDJW5SIjStringDoaGddGAObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4Gkga5QR4UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GA4JKc1WsUnorderedSetOfObjectOfNumberHo1ClIqDNumberHo1ClIqDStringDoaGddGANumberHo1ClIqDStringDoaGddGAStringDoaGddGABooleanVyG3AEThUdvP47QF12SAUrinUnorderedSetOfStringDoaGddGADvj0XlFaObjectHicl3T4F = ObjectHAgrRKSz | StringDoaGddGA | StringZDJW5SIj | UnorderedSetOfStringDoaGddGADvj0XlFa | NullQu0Arl1F | ObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4Gkga5QR4UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GA4JKc1Ws | UnorderedSetOfObjectOfNumberHo1ClIqDNumberHo1ClIqDStringDoaGddGANumberHo1ClIqDStringDoaGddGAStringDoaGddGABooleanVyG3AEThUdvP47QF12SAUrin | ObjectHicl3T4F;

export class OpenMowerRpc extends OpenMowerBaseRpc {
  rpc = {
    /**
    * Ping the server.
    */
    ping: async (): Promise<StringZDJW5SIj> => this.call('rpc.ping'),
    /**
    * List all available methods.
    */
    methods: async (): Promise<UnorderedSetOfStringDoaGddGADvj0XlFa> => this.call('rpc.methods'),
  };
  map = {
    /**
    * Replace the current map with a new one.
    */
    replace: async (...args: [map: ObjectHAgrRKSz]): Promise<void> => this.call('map.replace', args),
  };
  meta = {
    rpc: {
      /**
      * Ping the meta server.
      */
      ping: async (): Promise<StringZDJW5SIj> => this.call('meta.rpc.ping'),
    },
    config: {
      /**
      * Get the configuration schema.
      */
      schema: async (): Promise<StringDoaGddGA> => this.call('meta.config.schema'),
      /**
      * Get the default configuration values.
      */
      defaults: async (): Promise<ObjectHicl3T4F> => this.call('meta.config.defaults'),
    },
  };
  position = {
    /**
    * Returns compacted segments and the raw pending buffer for client seeding.
    */
    history: async (): Promise<ObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfStringDoaGddGAStringDoaGddGABooleanVyG3AETh8PZSKeKMFruGLaE4Gkga5QR4UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GA4JKc1Ws> => this.call('position.history'),
  };
  events = {
    /**
    * Returns events for today when called without params, or events for a specific date.
    */
    history: Object.assign(async (args: {date?: StringDoaGddGA}): Promise<UnorderedSetOfObjectOfNumberHo1ClIqDNumberHo1ClIqDStringDoaGddGANumberHo1ClIqDStringDoaGddGAStringDoaGddGABooleanVyG3AEThUdvP47QF12SAUrin> => this.call('events.history', args), {
      /**
      * List available event history dates.
      */
      list: async (): Promise<UnorderedSetOfStringDoaGddGADvj0XlFa> => this.call('events.history.list'),
    }),
  };
}
