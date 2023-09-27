import { SPAWN_ID, ROOM_ID } from "./constants";
import { Role } from "interfaces/Role";
import { ErrorMapper } from "utils/ErrorMapper";
import { distributeSourcesOf } from "distributeSources";
import { checkCreepSpawning } from "creepSpawning";
import { creepsLoop } from "creepLoop";
import { towersLoop } from "towerLoop";

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

    isSpecialCreep?: boolean;
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
  distributeSourcesOf(room);
  creepsLoop();
  checkCreepSpawning(spawn, room);
  towersLoop(room);
});
