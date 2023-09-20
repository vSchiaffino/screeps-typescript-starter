import { BUILDERS_NEEDED, KEEPERS_NEEDED, MAX_CREEPS } from "./constants";

export function balanceCreepRoles(room: Room) {
  const creepCount = Object.values(Game.creeps).length;

  const isCreeperDeficit = creepCount < MAX_CREEPS;

  if (isCreeperDeficit) {
    return {
      spawn_keeper: KEEPERS_NEEDED,
      harvester: creepCount - KEEPERS_NEEDED,
      builder: 0,
      upgrader: 0
    };
  }

  const areContainersFull = getFreeContainersCapacity(room) <= 0;
  const areStructuresFull = getFreeStructuresCapacity(room) <= 0;
  const areBuildersNeeded = room.find(FIND_CONSTRUCTION_SITES).length > 0;

  const harvesterCount = areContainersFull ? 0 : getHarvesterNeededForRoom(room);
  const keeperCount = areStructuresFull ? 0 : KEEPERS_NEEDED;
  const builderCount = areBuildersNeeded ? BUILDERS_NEEDED : 0;
  const upgradersCount = creepCount - harvesterCount - keeperCount - builderCount;

  return {
    spawn_keeper: keeperCount,
    harvester: harvesterCount,
    builder: builderCount,
    upgrader: upgradersCount
  };
}

export function getFreeContainersCapacity(room: Room): number {
  let structures = room.find<StructureContainer>(FIND_STRUCTURES, {
    filter: s => {
      return s.structureType === STRUCTURE_CONTAINER;
    }
  });
  return _.sum(structures.map(s => s.store.getFreeCapacity(RESOURCE_ENERGY)));
}

export function getHarvesterNeededForRoom(room: Room) {
  const energySources = room.find(FIND_SOURCES);
  return _.sum(energySources.map(source => getHarvestersNeededFor(source)));
}

export function getHarvestersNeededFor(source: Source): number {
  if (source.energy === 0) return 0;
  const sourcePos = source.pos;
  const room = source.room;

  const terrain = room.getTerrain();

  const walkablePositions = room
    .lookForAtArea(LOOK_TERRAIN, sourcePos.y - 1, sourcePos.x - 1, sourcePos.y + 1, sourcePos.x + 1, true)
    .filter(tile => terrain.get(tile.x, tile.y) !== TERRAIN_MASK_WALL);

  return walkablePositions.length;
}
function getFreeStructuresCapacity(room: Room) {
  let structures = room.find<AnyStoreStructure>(FIND_STRUCTURES, {
    filter: structure => {
      return (
        structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_SPAWN ||
        structure.structureType === STRUCTURE_TOWER
      );
    }
  });
  const ret = _.sum(structures.map(s => s.store.getFreeCapacity(RESOURCE_ENERGY)));
  console.log("getFreeStructuresCapacity ", ret);
  return ret;
}
