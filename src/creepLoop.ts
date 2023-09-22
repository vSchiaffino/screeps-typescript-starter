import Builder from "creep/Builder";
import Harvester from "creep/Harvester";
import SpawnKeeper from "creep/SpawnKeeper";
import Upgrader from "creep/Upgrader";

export function creepLoop(creep: Creep) {
  const role = creep.memory.role;
  const mapRoleWithClass = {
    harvester: Harvester,
    builder: Builder,
    upgrader: Upgrader,
    spawn_keeper: SpawnKeeper
  };
  const Class = mapRoleWithClass[role];
  const myCreep = new Class(creep);
  myCreep.loop();
}
