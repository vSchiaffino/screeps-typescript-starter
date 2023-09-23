import Builder from "creep/Builder";
import Harvester from "creep/Harvester";
import SpawnKeeper from "creep/SpawnKeeper";
import Upgrader from "creep/Upgrader";

export function creepsLoop() {
  purgeCreepMemory()
  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    creepLoop(creep);
  }
}

function purgeCreepMemory() {
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
}

function creepLoop(creep: Creep) {
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
