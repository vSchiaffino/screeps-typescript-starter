export function towersLoop(room: Room) {
  const towersInRoom = room.find<StructureTower>(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER
  });
  for (const tower of towersInRoom) {
    towerLoop(room, tower);
  }
}

function towerLoop(room: Room, tower: StructureTower) {
  const towerPos = tower.pos;

  const closestAllyCreepNeedingHeal = towerPos.findClosestByRange(FIND_HOSTILE_CREEPS, {
    filter: c => c.hits < c.hitsMax
  });
  const closestHostileCreep = towerPos.findClosestByRange(FIND_HOSTILE_CREEPS);
  const closestStructureNeedingRepair = towerPos.findClosestByRange(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
  });

  if (closestHostileCreep) {
    tower.attack(closestHostileCreep);
  } else if (closestAllyCreepNeedingHeal) {
    tower.heal(closestAllyCreepNeedingHeal);
  } else if (closestStructureNeedingRepair) {
    tower.repair(closestStructureNeedingRepair);
  }
}
