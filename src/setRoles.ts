import { balanceCreepRoles } from "balance";
import { Role } from "interfaces/Role";

export function setCreepRoles(room: Room) {
  let balance = balanceCreepRoles(room);
  const creeps = Object.values(Game.creeps);
  console.log("total: ", creeps.length, "balance ", JSON.stringify(balance));

  for (const creep of creeps) {
    const rolePriority: Role[] = [Role.SPAWN_KEEPER, Role.HARVESTER, Role.BUILDER, Role.UPGRADER];

    for (const role of rolePriority) {
      if (balance[role] > 0) {
        creep.memory.role = role;
        balance[role]--;
        break;
      }
    }
  }
}
