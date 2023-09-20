import { getHarvestersNeededFor } from "balance";
import { Role } from "interfaces/Role";

export function distributeSourcesOf(room: Room) {
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
