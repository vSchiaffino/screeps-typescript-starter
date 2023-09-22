import { SPAWN_ID, ROOM_ID } from "./constants";
import { Role } from "interfaces/Role";
import { ErrorMapper } from "utils/ErrorMapper";
import { setCreepRoles } from "setRoles";
import { distributeSourcesOf } from "distributeSources";
import { checkCreepSpawning } from "creepSpawning";
import { creepLoop } from "creepLoop";

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

    dndTimer?: number;
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

  setCreepRoles(room);
  distributeSourcesOf(room);
  
  for (const creepName in Game.creeps) {
    const creep = Game.creeps[creepName];
    creepLoop(creep);
  }

  checkCreepSpawning(spawn, room);
});
