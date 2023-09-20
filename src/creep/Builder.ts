import MyCreep from "./MyCreep";

export default class Builder extends MyCreep {
  public loop(): void {
    const isStoreFull = this.creep.store.getFreeCapacity() == 0;
    const isStoreEmpty = this.creep.store[RESOURCE_ENERGY] == 0;
    const isBuilding = this.creep.memory.building;

    if (isBuilding && isStoreEmpty) this.startEnergyLookup();
    if (!isBuilding && isStoreFull) this.startBuilding();

    if (this.creep.memory.building) {
      this.build();
    } else {
      this.lookForEnergy();
    }
  }

  private startBuilding() {
    this.creep.memory.building = true;
    // this.creep.say("🚧 build");
  }

  private startEnergyLookup() {
    this.creep.memory.upgrading = false;
    // this.creep.say("🔄 energy");
  }
}
