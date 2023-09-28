import ResourceWorker from "./ResourceWorker";

export default class Upgrader extends ResourceWorker {
  protected work(): void {
    this.upgrade();
  }

  protected getNearestContainer(): StructureStorage | StructureContainer | null {
    return this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        const isStorage = structure.structureType == STRUCTURE_STORAGE;
        const isContainer = structure.structureType === STRUCTURE_CONTAINER;
        // const controller = this.creep.room.controller;
        // if (controller === undefined) return false;
        // const isNearbyController = controller.pos.findPathTo(structure).length < 5;
        return isStorage || isContainer;
      }
    });
  }
}
