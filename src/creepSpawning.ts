import { MAX_CREEPS, WORST_CREEP_SPAWN_COST, CREEP_SPAWN_COST } from "./constants";
import { Role } from "interfaces/Role";

export function checkCreepSpawning(spawn: StructureSpawn, room: Room) {
  const creepCount = Object.keys(Game.creeps).length;
  const canSpawnBestCreep = room.energyAvailable >= CREEP_SPAWN_COST;
  const canSpawnWorstCreep = room.energyAvailable >= WORST_CREEP_SPAWN_COST;
  const areCreepsAlive = creepCount > 0;
  const bestCreepBody = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
  const worstCreepBody = [WORK, CARRY, MOVE];

  if (canSpawnBestCreep && creepCount < MAX_CREEPS) {
    spawnNewCreep(spawn, bestCreepBody);
  } else if (!areCreepsAlive && canSpawnWorstCreep) {
    spawnNewCreep(spawn, worstCreepBody);
  }
}

function spawnNewCreep(spawn: StructureSpawn, creepBody: BodyPartConstant[]) {
  spawn.spawnCreep(creepBody, `Creep${Game.time}`, {
    memory: { role: Role.HARVESTER }
  });
}
