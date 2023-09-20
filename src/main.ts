import { SPAWN_ID, MAX_CREEPS, CREEP_SPAWN_COST, ROOM_ID } from "./constants";
import Builder from "creep/Builder";
import Harvester from "creep/Harvester";
import SpawnKeeper from "creep/SpawnKeeper";
import Upgrader from "creep/Upgrader";
import { Role } from "interfaces/Role";
import { ErrorMapper } from "utils/ErrorMapper";
import { setRoles } from "setRoles";
import { distributeSourcesOf } from "distributeSources";

declare global {
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: Role;
    room?: string;

    assignedToSource?: string;
    harvestingIn?: string;

    isWorking?: boolean;
  }

  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  const room = Game.rooms[ROOM_ID];
  const spawn = Game.spawns[SPAWN_ID];
  const creeps = Object.values(Game.creeps);

  setRoles(room);
  distributeSourcesOf(room);

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    creepLoop(creep);
  }

  if (room.energyAvailable >= CREEP_SPAWN_COST && creeps.length < MAX_CREEPS) {
    spawnNewCreep(spawn);
  }
});

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

function spawnNewCreep(spawn: StructureSpawn) {
  spawn.spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], `Creep${Game.time}`, {
    memory: { role: Role.HARVESTER }
  });
}
