import MyCreep from "./MyCreep";

export default class SpawnKeeper extends MyCreep {
  public loop(): void {
    const structuresNeedingEnergy = this.getStructuresNeedingEnergy();
    if (structuresNeedingEnergy.length === 0) {
      // this.creep.say("idle");
      return;
    }

    const isStoreFull = this.creep.store.getFreeCapacity() == 0;
    const isStoreEmpty = this.creep.store[RESOURCE_ENERGY] == 0;
    const isBuilding = this.creep.memory.building;

    if (isBuilding && isStoreEmpty) this.startEnergyLookup();
    if (!isBuilding && isStoreFull) this.startKeeping();

    if (this.creep.memory.building) {
      const nearestStructure = this.getNearestStructure(structuresNeedingEnergy);
      if (!nearestStructure) throw new Error();
      if (this.creep.transfer(nearestStructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(nearestStructure, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    } else {
      this.lookForEnergy();
    }
  }

  private startKeeping() {
    this.creep.memory.building = true;
    // this.creep.say("🚧 keep");
  }

  private startEnergyLookup() {
    this.creep.memory.building = false;
    // this.creep.say("🔄 energy");
  }
}
