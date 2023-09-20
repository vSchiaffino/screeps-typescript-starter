import Builder from "creep/Builder";
import Harvester from "creep/Harvester";
import Upgrader from "creep/Upgrader";
import { ErrorMapper } from "utils/ErrorMapper";

export enum Role {
  HARVESTER = "harvester",
  BUILDER = "builder",
  UPGRADER = "upgrader"
}

declare global {
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: Role;
    room?: string;

    harvestingIn?: string;
    building?: boolean;
    working?: boolean;
    upgrading?: boolean;
  }

  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

interface Stats {
  creepCount: number;
  harvesterCount: number;
}

const creepDistribution = {
  harvester: 5,
  upgrader: 5,
  builder: 5
};
const MAX_CREEPS = _.sum(Object.values(creepDistribution));
const CREEP_SPAWN_COST = 200;
const ROOM_ID = "W29N47";

function getStats(): Stats {
  const allCreeps = Object.values(Game.creeps);

  const creepCount = allCreeps.length;
  const harvesterCount = allCreeps.filter(creep => creep.memory.role === Role.HARVESTER).length;
  return {
    creepCount,
    harvesterCount
  };
}

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  const room = Game.rooms[ROOM_ID];
  const spawn = Game.spawns["Spawn1"];

  const energySources = room.find(FIND_SOURCES);

  // const spawn = Game.spawns["Spawn1"];
  // const room = Game.rooms[ROOM_ID];
  const stats = getStats();

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    creepLoop(creep);
  }

  if (room.energyAvailable >= CREEP_SPAWN_COST && stats.creepCount < MAX_CREEPS) {
    spawnNewCreep(spawn);
  }
  if (stats.creepCount === MAX_CREEPS) {
    balanceCreepRoles(stats);
  }
});

function creepLoop(creep: Creep) {
  const role = creep.memory.role;
  const mapRoleWithClass = {
    harvester: Harvester,
    builder: Builder,
    upgrader: Upgrader
  };
  const Class = mapRoleWithClass[role];
  const myCreep = new Class(creep);
  myCreep.loop();
}

function spawnNewCreep(spawn: StructureSpawn) {
  spawn.spawnCreep([WORK, CARRY, MOVE], `Creep${Game.time}`, { memory: { role: Role.HARVESTER } });
}

function balanceCreepRoles(stats: Stats) {
  const room = Game.rooms[ROOM_ID];
  const creeps = Object.values(Game.creeps);
  let harvestersCount = creepDistribution.harvester;
  let upgradersCount = creepDistribution.upgrader;
  let buildersCount = creepDistribution.builder;

  const isRoomFullOfEnergy = room.energyAvailable === room.energyCapacityAvailable;
  if (isRoomFullOfEnergy) {
    buildersCount += harvestersCount;
    harvestersCount = 0;
  }

  const needBuilders = Object.keys(Game.constructionSites).length > 0;

  if (!needBuilders) {
    upgradersCount += buildersCount;
    buildersCount = 0;
  }

  console.log(`Balance {harvester: ${harvestersCount}, builders: ${buildersCount}, upgraders: ${upgradersCount} }`);

  creeps.splice(0, harvestersCount).forEach(creep => (creep.memory.role = Role.HARVESTER));
  creeps.splice(0, buildersCount).forEach(creep => (creep.memory.role = Role.BUILDER));
  creeps.splice(0, upgradersCount).forEach(creep => (creep.memory.role = Role.UPGRADER));
}
