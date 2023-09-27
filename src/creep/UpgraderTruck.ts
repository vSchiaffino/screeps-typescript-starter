import ResourceWorker from "./ResourceWorker";

export default class UpgraderTruck extends ResourceWorker {
  protected work(): void {
    const upgrader = this.creep.pos.findClosestByPath(FIND_MY_CREEPS, {
      filter: creep => creep.memory.role === "upgrader" && creep.store.getFreeCapacity() > 50
    });
    if (upgrader === null) {
      this.creep.moveTo(this.creep.room.controller as StructureController, {
        visualizePathStyle: { stroke: "#ffffff" }
      });
      this.creep.say("idle");
    } else if (this.creep.transfer(upgrader, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(upgrader, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  }

  protected getNearestContainer(): StructureContainer | null {
    return this.creep.pos.findClosestByPath<StructureContainer>(FIND_STRUCTURES, {
      filter: structure => {
        const isStorage = structure.structureType == STRUCTURE_STORAGE;
        const isContainer = structure.structureType === STRUCTURE_CONTAINER;
        return (isStorage || isContainer) && structure.store.energy > this.creep.store.getFreeCapacity();
      }
    });
  }
}
