import { KafkaSockets } from "kafka/sockets";
import { Sockets } from "common/controllers";

export const socketsDataStore = new Sockets();

export const ItemsDataSocketsEmitter = KafkaSockets({
  sockets: socketsDataStore,
  name: "ItemsData",
});

export const socketsDocumentStore = new Sockets();

export const ItemsDocumentSocketsEmitter = KafkaSockets({
  sockets: socketsDocumentStore,
  name: "ItemsDocument",
});
