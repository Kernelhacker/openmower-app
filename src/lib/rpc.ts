// GENERATED FILE, DO NOT EDIT!!!
/* eslint-disable @typescript-eslint/no-explicit-any */

import OpenMowerBaseRpc from './rpc-base';

export type StringDoaGddGA = string;
export type BooleanVyG3AETh = boolean;
export interface ObjectOfBooleanVyG3AEThQUdUNSIA {
  blades?: BooleanVyG3AETh;
  [k: string]: any;
}
export type NumberHo1ClIqD = number;
export type UnorderedSetOfNumberHo1ClIqDAokMKuEf = NumberHo1ClIqD[];
export type UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G = UnorderedSetOfNumberHo1ClIqDAokMKuEf[];
export interface ObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3Lx {
  attributes?: ObjectOfBooleanVyG3AEThQUdUNSIA;
  points?: UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G;
  [k: string]: any;
}
export type UnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3LxD0QdRchK = ObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3Lx[];
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
export interface ObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3LxD0QdRchKUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G58KCbAdo {
  segments?: UnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3LxD0QdRchK;
  buffer?: UnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G;
  [k: string]: any;
}
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
export type AnyOfObjectHAgrRKSzStringZDJW5SIjUnorderedSetOfStringDoaGddGADvj0XlFaNullQu0Arl1FStringZDJW5SIjStringDoaGddGAObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3LxD0QdRchKUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G58KCbAdoObjectHicl3T4F = ObjectHAgrRKSz | StringZDJW5SIj | UnorderedSetOfStringDoaGddGADvj0XlFa | NullQu0Arl1F | StringDoaGddGA | ObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3LxD0QdRchKUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G58KCbAdo | ObjectHicl3T4F;

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
    history: async (): Promise<ObjectOfUnorderedSetOfObjectOfUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5GObjectOfBooleanVyG3AEThQUdUNSIAZ7M3V3LxD0QdRchKUnorderedSetOfUnorderedSetOfNumberHo1ClIqDAokMKuEfbuExLS5G58KCbAdo> => this.call('position.history'),
  };
}
