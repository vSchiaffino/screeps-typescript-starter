import {
  WORST_CREEP_SPAWN_COST,
  CREEP_SPAWN_COST,
  KEEPERS_NEEDED,
  BUILDERS_NEEDED,
  UPGRADERS_NEEDED,
  UPGRADER_TRUCK_NEEDED
} from "./constants";
import { Role } from "interfaces/Role";

export function checkCreepSpawning(spawn: StructureSpawn, room: Room) {
  const harvestersNeeded = getHarvesterNeededForRoom(room);
  const creepsNeeded = KEEPERS_NEEDED + harvestersNeeded + BUILDERS_NEEDED + UPGRADERS_NEEDED + UPGRADER_TRUCK_NEEDED;
  const creepCount = Object.keys(Game.creeps).length;
  const canSpawnBestCreep = room.energyAvailable >= CREEP_SPAWN_COST;
  const canSpawnWorstCreep = room.energyAvailable >= WORST_CREEP_SPAWN_COST;
  const areCreepsAlive = creepCount > 0;

  if (canSpawnBestCreep && creepCount < creepsNeeded) {
    spawnNewCreep(spawn);
  } else if (!areCreepsAlive && canSpawnWorstCreep) {
    spawn.spawnCreep([WORK, CARRY, MOVE], `Creep${Game.time}`, {
      memory: { role: Role.SPAWN_KEEPER }
    });
  }

  const needed = {
    harvesters: harvestersNeeded,
    keepers: KEEPERS_NEEDED,
    builders: BUILDERS_NEEDED,
    upgraders: UPGRADERS_NEEDED
  };
  console.log(
    "Needed: ",
    JSON.stringify(needed),
    "total: ",
    Object.values(needed).reduce((acc: number, curr: number) => acc + curr, 0)
  );
  // if (creepCount < MAX_CREEPS && canSpawnWorstCreep) {
  //   spawnNewCreep(spawn, worstCreepBody);
  // }
}

function spawnNewCreep(spawn: StructureSpawn) {
  // const creeps = Object.values(Game.creeps);
  // let role = Role.BUILDER;
  // let isSpecialCreep = false;
  // let creepBody = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
  // let name = `Creep${Game.time}`;
  // const spawnKeepersCount = creeps.filter(creep => creep.memory.role === Role.SPAWN_KEEPER).length;
  // const harvesterCount = creeps.filter(creep => creep.memory.role === Role.HARVESTER).length;
  // if (spawnKeepersCount < KEEPERS_NEEDED) {
  //   name = `Keeper${Game.time}`;
  //   creepBody = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
  //   role = Role.SPAWN_KEEPER;
  //   isSpecialCreep = true;
  // } else if (harvesterCount < getHarvesterNeededForRoom(spawn.room)) {
  //   name = `Harvester${Game.time}`;
  //   creepBody = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, CARRY, CARRY];
  //   role = Role.HARVESTER;
  //   isSpecialCreep = true;
  // }
  const { body, role, name } = getNextCreepToSpawn(spawn.room);
  spawn.spawnCreep(body, name, {
    memory: { role, isSpecialCreep: true }
  });
}

export function getNextCreepToSpawn(room: Room) {
  const creeps = Object.values(Game.creeps);
  const keepersCount = creeps.filter(creep => creep.memory.role === Role.SPAWN_KEEPER).length;
  const harvesterCount = creeps.filter(creep => creep.memory.role === Role.HARVESTER).length;
  const buildersCount = creeps.filter(creep => creep.memory.role === Role.BUILDER).length;
  const trucksCount = creeps.filter(creep => creep.memory.role === Role.UPGRADER_TRUCK).length;

  const needsTruck = trucksCount < UPGRADER_TRUCK_NEEDED;
  const needsBuilder = buildersCount < BUILDERS_NEEDED;
  const needKeeper = keepersCount < KEEPERS_NEEDED;
  const needHarvester = harvesterCount < getHarvesterNeededForRoom(room);

  const bodyByRole: { [x: string]: BodyPartConstant[] } = {
    harvester: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY],
    spawn_keeper: Array(13).fill(CARRY).concat(Array(13).fill(MOVE)),
    builder: Array(8).fill(WORK).concat(Array(6).fill(MOVE)).concat(Array(4).fill(CARRY)),
    upgrader: Array(7).fill(WORK).concat(Array(8).fill(MOVE)).concat(Array(4).fill(CARRY)),
    upgrader_truck: Array(18).fill(CARRY).concat(Array(8).fill(MOVE))
  };

  const role = needKeeper
    ? Role.SPAWN_KEEPER
    : needHarvester
    ? Role.HARVESTER
    : needsBuilder
    ? Role.BUILDER
    : needsTruck
    ? Role.UPGRADER_TRUCK
    : Role.UPGRADER;

  const body = bodyByRole[role];
  const name = `${role}${Game.time}`;

  return { body, role, name };
}

export function getHarvesterNeededForRoom(room: Room) {
  const energySources = room.find(FIND_SOURCES);
  return _.sum(energySources.map(source => getHarvestersNeededFor(source)));
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
