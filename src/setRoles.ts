import { balanceCreepRoles } from "balance";
import { Role } from "interfaces/Role";

export function setRoles(room: Room) {
  let balance = balanceCreepRoles(room);
  console.log("balance", JSON.stringify(balance));
  const creeps = Object.values(Game.creeps);

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
