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
    let structure = this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE) &&
          structure.pos.findPathTo(structure).length < 6 &&
          structure.store.getFreeCapacity() > 0
        );
      }
    });

    if (structure) {
      if (this.creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(structure, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    } else {
      this.creep.say("full");
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
