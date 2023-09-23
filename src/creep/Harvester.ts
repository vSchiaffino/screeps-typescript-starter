import MyCreep from "./MyCreep";

export default class Harvester extends MyCreep {
  public loop(): void {
    const canStoreMoreEnergy = this.creep.store.getFreeCapacity() > 0;
    if (canStoreMoreEnergy) {
      this.harvest();
    } else {
      this.storeEnergyInStructure();
    }
  }

  protected storeEnergyInStructure(): void {
    let structures = this.creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) &&
          structure.store.getFreeCapacity() > 0
        );
      }
    });

    structures.sort((structureA, structureB) => {
      const distanceA = this.creep.pos.getRangeTo(structureA);
      const distanceB = this.creep.pos.getRangeTo(structureB);
      return distanceA - distanceB;
    });

    if (structures.length > 0) {
      if (this.creep.transfer(structures[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(structures[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }

  protected harvest(): void {
    if (!this.creep.memory.assignedToSource) {
      console.log("Not assigned to source");
      return;
    }

    const source = Game.getObjectById(this.creep.memory.assignedToSource) as any as Source;

    if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  }
}
