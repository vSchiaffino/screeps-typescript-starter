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

    assignedToSource?: string;
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
const SPAWN_ID = "Spawn1";

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
  const spawn = Game.spawns[SPAWN_ID];
  const stats = getStats();
  const creeps = Object.values(Game.creeps);
  const energySources = room.find(FIND_SOURCES);
  const harvestersNeeded = _.sum(energySources.map(source => getHarvestersNeededFor(source)));

  balanceCreepRoles(stats, harvestersNeeded);
  assignHarvestersToSources();

  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    creepLoop(creep);
  }

  if (room.energyAvailable >= CREEP_SPAWN_COST && stats.creepCount < MAX_CREEPS) {
    spawnNewCreep(spawn);
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

function balanceCreepRoles(stats: Stats, harvestersCount: number) {
  const room = Game.rooms[ROOM_ID];
  const creeps = Object.values(Game.creeps);

  const needBuilders = Object.keys(Game.constructionSites).length > 0;
  const buildersCount = needBuilders ? 5 : 0;
  
  let upgradersCount = MAX_CREEPS - harvestersCount - buildersCount;

  console.log(`Balance {harvester: ${harvestersCount}, builders: ${buildersCount}, upgraders: ${upgradersCount} }`);

  creeps.splice(0, harvestersCount).forEach(creep => (creep.memory.role = Role.HARVESTER));
  creeps.splice(0, buildersCount).forEach(creep => (creep.memory.role = Role.BUILDER));
  creeps.splice(0, upgradersCount).forEach(creep => (creep.memory.role = Role.UPGRADER));
}

export function getHarvestersNeededFor(source: Source): number {
  const sourcePos = source.pos;
  const room = source.room;

  const terrain = room.getTerrain();

  const walkablePositions = room
    .lookForAtArea(LOOK_TERRAIN, sourcePos.y - 1, sourcePos.x - 1, sourcePos.y + 1, sourcePos.x + 1, true)
    .filter(tile => terrain.get(tile.x, tile.y) !== TERRAIN_MASK_WALL);

  return walkablePositions.length;
}

function convertAllCreepsToHarvesters() {
  console.log(`since we have ${Object.keys(Game.creeps).length} creeps we are converting all to harvesters`);
  for (const creep of Object.values(Game.creeps)) {
    creep.memory.role = Role.HARVESTER;
  }
}

function assignHarvestersToSources() {
  const room = Game.rooms[ROOM_ID];
  const creeps = Object.values(Game.creeps);

  const energySources = room.find(FIND_SOURCES);
  const harvestersBySource: { [sourceId: string]: Creep[] } = {};
  const harvesters = creeps.filter(creep => creep.memory.role === Role.HARVESTER);
  const unnasignedHarvesters = harvesters.filter(c => c.memory.assignedToSource === undefined);

  for (const source of energySources) {
    const needed = getHarvestersNeededFor(source);
    const assignedToThisSource = harvesters.filter(creep => creep.memory.assignedToSource === source.id);
    if (assignedToThisSource.length < needed) {
      assignedToThisSource.push(...unnasignedHarvesters.splice(0, needed - assignedToThisSource.length));
    }
    harvestersBySource[source.id] = assignedToThisSource;
  }

  for (const [sourceId, harvesters] of Object.entries(harvestersBySource)) {
    for (const creep of harvesters) {
      creep.memory.assignedToSource = sourceId;
    }
  }
}
